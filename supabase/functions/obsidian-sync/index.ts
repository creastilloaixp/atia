// =============================================
// OBSIDIAN-SYNC Edge Function
// Recibe webhooks de GitHub cuando se hace push
// a la bóveda de Obsidian y sincroniza el contenido
// en la tabla knowledge_base de Supabase.
// =============================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET") || "";

// Extraer el "topic" del nombre del archivo
// Ej: "Ventas/Requisitos.md" -> "Ventas"
// Ej: "knowledge/Ventas/Embudo.md" -> "Ventas" (strips "knowledge" prefix)
// Ej: "Rentas.md" -> "Rentas"
// Ej: "README.md" -> "General"
function extractTopic(filePath: string): string {
  let parts = filePath.replace(/\.md$/i, "").split("/");
  
  // Strip common prefix folders that aren't actual topics
  const prefixesToSkip = ["knowledge", "docs", "obsidian", "vault"];
  while (parts.length > 1 && prefixesToSkip.includes(parts[0].toLowerCase())) {
    parts = parts.slice(1);
  }
  
  // If it's a root file (no subfolder), categorize it
  if (parts.length === 1) {
    const name = parts[0].toLowerCase();
    if (name === "readme" || name === "index") return "General";
    return parts[0]; // Use filename as topic
  }
  
  // Use the first real folder as topic (Ventas, Rentas, etc.)
  return parts[0];
}

// Verificar la firma del webhook de GitHub (HMAC SHA-256)
async function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!secret || !signature) return !secret; // Si no hay secret configurado, permite (dev mode)

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const digest = `sha256=${Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  return digest === signature;
}

Deno.serve(async (req: Request) => {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();

    // Verificar firma de GitHub (seguridad)
    const signature = req.headers.get("x-hub-signature-256");
    if (GITHUB_WEBHOOK_SECRET) {
      const isValid = await verifyGitHubSignature(
        body,
        signature,
        GITHUB_WEBHOOK_SECRET
      );
      if (!isValid) {
        console.error("❌ Invalid GitHub webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(body);

    // Verificar que es un evento push
    const event = req.headers.get("x-github-event");
    if (event === "ping") {
      return new Response(JSON.stringify({ message: "pong 🏓" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event !== "push") {
      return new Response(
        JSON.stringify({ message: "Event ignored", event }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extraer info del push
    const repoName = payload.repository?.name || "unknown";
    const commitSha = payload.after || "";
    const commits = payload.commits || [];

    // Recopilar todos los archivos .md que fueron modificados o agregados
    const mdFiles = new Set<string>();
    const deletedFiles = new Set<string>();

    for (const commit of commits) {
      for (const file of commit.added || []) {
        if (file.endsWith(".md")) mdFiles.add(file);
      }
      for (const file of commit.modified || []) {
        if (file.endsWith(".md")) mdFiles.add(file);
      }
      for (const file of commit.removed || []) {
        if (file.endsWith(".md")) deletedFiles.add(file);
      }
    }

    console.log(
      `📥 Push received from ${repoName}: ${mdFiles.size} files to sync, ${deletedFiles.size} to delete`
    );

    // Inicializar Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Obtener el token de GitHub para descargar archivos
    const githubToken = Deno.env.get("GITHUB_PAT") || "";
    const repoFullName = payload.repository?.full_name; // "usuario/repo"
    const branch = payload.ref?.replace("refs/heads/", "") || "main";

    const results: { synced: string[]; deleted: string[]; errors: string[] } = {
      synced: [],
      deleted: [],
      errors: [],
    };

    // SYNC: Descargar y guardar cada archivo .md modificado/nuevo
    for (const filePath of mdFiles) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/${branch}/${filePath}`;
        const headers: Record<string, string> = {};
        if (githubToken) {
          headers["Authorization"] = `token ${githubToken}`;
        }

        const fileResponse = await fetch(rawUrl, { headers });
        if (!fileResponse.ok) {
          results.errors.push(`Failed to fetch ${filePath}: ${fileResponse.status}`);
          continue;
        }

        const content = await fileResponse.text();
        const topic = extractTopic(filePath);

        // UPSERT: Insertar o actualizar basado en file_path
        const { error } = await supabase.from("knowledge_base").upsert(
          {
            file_path: filePath,
            topic,
            content,
            repo_name: repoName,
            commit_sha: commitSha,
          },
          { onConflict: "file_path" }
        );

        if (error) {
          console.error(`❌ Error upserting ${filePath}:`, error);
          results.errors.push(`DB error for ${filePath}: ${error.message}`);
        } else {
          console.log(`✅ Synced: ${filePath} (topic: ${topic})`);
          results.synced.push(filePath);
        }
      } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err);
        results.errors.push(`${filePath}: ${err.message}`);
      }
    }

    // DELETE: Eliminar archivos que fueron removidos del repo
    for (const filePath of deletedFiles) {
      try {
        const { error } = await supabase
          .from("knowledge_base")
          .delete()
          .eq("file_path", filePath);

        if (error) {
          results.errors.push(`Delete error for ${filePath}: ${error.message}`);
        } else {
          console.log(`🗑️ Deleted: ${filePath}`);
          results.deleted.push(filePath);
        }
      } catch (err) {
        results.errors.push(`${filePath}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        repo: repoName,
        commit: commitSha.substring(0, 7),
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ obsidian-sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

// =============================================================================
// Atia — Send WhatsApp Voice Note (TTS via Gemini → Storage → Evolution API)
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── WAV header for PCM data ────────────────────────────────────────────
function createWavHeader(dataSize: number, sampleRate: number, channels: number, bitsPerSample: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  v.setUint32(0, 0x52494646, false);  // RIFF
  v.setUint32(4, 36 + dataSize, true);
  v.setUint32(8, 0x57415645, false);  // WAVE
  v.setUint32(12, 0x666D7420, false); // fmt
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);           // PCM
  v.setUint16(22, channels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true);
  v.setUint16(32, channels * (bitsPerSample / 8), true);
  v.setUint16(34, bitsPerSample, true);
  v.setUint32(36, 0x64617461, false); // data
  v.setUint32(40, dataSize, true);
  return new Uint8Array(header);
}

// ── base64 decode ──────────────────────────────────────────────────────
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const errors: string[] = [];

  try {
    const { phone, message } = await req.json();
    if (!phone || !message) {
      return new Response(JSON.stringify({ error: "phone y message son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[VN] TTS for "${message.slice(0, 50)}..." → ${phone}`);

    // ── Step 1: Generate TTS via Gemini ─────────────────────────────
    let audioBytes: Uint8Array | null = null;

    // Try TTS-dedicated model (text only, no instructions)
    const ttsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          },
        }),
      }
    );

    if (ttsRes.ok) {
      const data = await ttsRes.json();
      const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        const pcm = b64ToBytes(inlineData.data);
        const mime = inlineData.mimeType || "";
        console.log(`[VN] TTS ok: ${mime}, ${pcm.length} bytes PCM`);

        // Convert PCM to WAV
        const wavHeader = createWavHeader(pcm.length, 24000, 1, 16);
        audioBytes = new Uint8Array(wavHeader.length + pcm.length);
        audioBytes.set(wavHeader, 0);
        audioBytes.set(pcm, wavHeader.length);
        console.log(`[VN] WAV: ${audioBytes.length} bytes`);
      } else {
        errors.push("TTS response had no audio data");
      }
    } else {
      const errText = await ttsRes.text();
      errors.push(`TTS ${ttsRes.status}: ${errText.slice(0, 150)}`);
      console.error(`[VN] TTS failed:`, errText.slice(0, 200));
    }

    if (!audioBytes) {
      // Fallback: send as text
      console.log("[VN] TTS failed, sending as text");
      await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, text: `🎙️ ${message}` }),
      });
      return new Response(JSON.stringify({ status: "ok", phone, type: "text_fallback", errors }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Step 2: Upload WAV to Supabase Storage ─────────────────────
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    const fileName = `voice-notes/vn_${Date.now()}.wav`;

    const { error: uploadErr } = await sb.storage
      .from("media")
      .upload(fileName, audioBytes, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (uploadErr) {
      // Try creating the bucket if it doesn't exist
      console.log("[VN] Upload failed, trying to create bucket:", uploadErr.message);
      await sb.storage.createBucket("media", { public: true });
      const { error: retryErr } = await sb.storage
        .from("media")
        .upload(fileName, audioBytes, { contentType: "audio/wav", upsert: true });
      if (retryErr) {
        errors.push(`Storage upload: ${retryErr.message}`);
        console.error("[VN] Storage upload failed:", retryErr.message);
        // Fallback to text
        await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
          method: "POST",
          headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ number: phone, text: `🎙️ ${message}` }),
        });
        return new Response(JSON.stringify({ status: "ok", phone, type: "text_fallback", errors }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get public URL
    const { data: urlData } = sb.storage.from("media").getPublicUrl(fileName);
    const audioUrl = urlData.publicUrl;
    console.log(`[VN] Uploaded: ${audioUrl}`);

    // ── Step 3: Send via Evolution API ─────────────────────────────
    let sent = false;

    // Try sendWhatsAppAudio (voice note with waveform)
    try {
      const r = await fetch(`${EVOLUTION_API_URL}/message/sendWhatsAppAudio/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, audio: audioUrl }),
      });
      if (r.ok) {
        sent = true;
        console.log(`[VN] Sent via sendWhatsAppAudio`);
      } else {
        const e = await r.text();
        errors.push(`sendWhatsAppAudio ${r.status}: ${e.slice(0, 100)}`);
        console.error(`[VN] sendWhatsAppAudio failed:`, e.slice(0, 150));
      }
    } catch (e) {
      errors.push(`sendWhatsAppAudio: ${(e as Error).message}`);
    }

    // Try sendMedia as audio
    if (!sent) {
      try {
        const r = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
          method: "POST",
          headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ number: phone, mediatype: "audio", media: audioUrl }),
        });
        if (r.ok) {
          sent = true;
          console.log(`[VN] Sent via sendMedia/audio`);
        } else {
          const e = await r.text();
          errors.push(`sendMedia ${r.status}: ${e.slice(0, 100)}`);
        }
      } catch (e) {
        errors.push(`sendMedia: ${(e as Error).message}`);
      }
    }

    // Final fallback: text
    if (!sent) {
      await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, text: `🎙️ ${message}` }),
      });
    }

    // Cleanup: delete file after 60s (non-blocking)
    setTimeout(async () => {
      await sb.storage.from("media").remove([fileName]).catch(() => {});
    }, 60000);

    return new Response(JSON.stringify({
      status: "ok",
      phone,
      type: sent ? "voice_note" : "text_fallback",
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[VN] Error:", msg);
    return new Response(JSON.stringify({ error: msg, errors }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

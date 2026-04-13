# Manifiesto Estratégico "Casto" Inmobiliaria
## Visión de Crecimiento Nacional y Automatización Operativa

Este documento resume las 6 áreas de oportunidad clave identificadas para que Casto Inmobiliaria logre su visión de expansión nacional y automatización de la "máquina de citas".

---

### 1. 📂 Sincronización Multi-Org (Global CRM)
*   **Estado:** Implementado (v2.0). 
*   **Visión:** Una sola base de datos (Supabase) con una entrada universal (`incoming-lead`). Cada dominio regional (`culiacan`, `mazatlan`, `monterrey`) captura leads con un `org_id` y `vertical` único para que el CRM Global los asigne automáticamente a los asesores de esa zona.

### 2. 📍 Micro-personalización Dinámica (SEO Local)
*   **Estado:** Implementado (v1.0).
*   **Visión:** La landing reacciona al dominio de origen. Si vienes de `inmobiliariamonterrey.com`, la página muestra: *"Liquidamos tus deudas en MONTERREY"*. Esto aumenta la confianza del usuario y mejora el SEO local al hablar de problemas territoriales específicos.

### 3. 🤖 Automatización "Adriana" (WhatsApp)
*   **Estado:** Gancho preparado en el código.
*   **Visión:** El "Speed to Lead" debe ser < 5 minutos. En cuanto cae el lead, un bot dispara un mensaje preguntando por la Clave Catastral o adeudos exactos, perfilando al cliente antes de que el humano tome el teléfono.

### 4. 📈 Métrica Maestra: "La Cita es la Venta"
*   **Métrica de Oro:** No medimos clicks, medimos **CITAS AGENDADAS**.
*   **Acción:** El sistema de leads envía el estatus `nuevo_prospecto`. El KPI final de Edson y Castor es el costo por cita generada por ciudad.

### 5. 🛡️ Estructura de Autoridad (Prueba Social)
*   **Próximo Paso:** Inclusión de videos testimoniales reales de saneamiento de deudas.
*   **Objetivo:** Bajar el miedo al fraude. Mostrar que Casto es un aliado legal ante Notario Público.

### 6. 🔄 Venta Cruzada (LTV)
*   **Estrategia:** Convertir al vendedor (Flipping) en un inquilino (Administración). 
*   **Flujo:** "Te compro tu casa con deuda → Te libero del problema financiero → Te rento una de mis propiedades administradas". Ganar dos veces con el mismo cliente.

---

### ✅ Checklist de Implementación Técnica:
- [x] Landing Light Mode (Fondo Blanco + Naranja Atia).
- [x] Captura de Leads Multi-Tenant (Org ID + Vertical).
- [x] Diagnóstico de Saneamiento de Deuda (UX simplificado).
- [x] Playbook de Objeciones para Jóvenes Aprendices.
- [ ] Dashboard de Visión para Castor (En progreso).

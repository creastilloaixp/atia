# REQUERIMIENTOS TÉCNICOS: INTEGRACIÓN DE AUTOMATIZACIÓN DE LEADS

**Proyecto:** Casto Lead Generator 2026\
**Estatus:** Levantamiento Técnico / Configuración de Workflow\
**Fecha:** 13 de Marzo, 2026

---

## 1. Resumen del Flujo de Automatización (n8n)

Se ha diseñado un ecosistema de respuesta inmediata compuesto por **7 nodos**
lógicos que garantizan la integridad de los datos y la inmediatez del contacto
comercial bajo una arquitectura orientada a la conversión.

**Arquitectura del Workflow:**

- **Webhook:** Receptor de leads desde la Landing Page con soporte CORS.
- **Code (Normalización):** Validación de nombre (min. 2 chars) y limpieza de
  teléfono (formato internacional +52).
- **IF (Validación):** Filtro de seguridad para descartar leads incompletos.
- **Kommo CRM:** Inserción automática de Trato y Contacto en el funnel de
  ventas.
- **Zadarma Callback:** Disparo de llamada automática entre el agente y el
  cliente.
- **Response (Success/Error):** Retroalimentación inmediata al navegador para
  mejorar la experiencia UX.

---

## 2. Datos Requeridos para Activación (Pendientes)

Para completar la implementación y activar el sistema de "Respuesta en <10
Segundos", el cliente debe proporcionar la siguiente información:

### A. Kommo CRM (Configuración de Pipeline)

- **Dominio de Instancia:** La URL de acceso al CRM (ejemplo:
  `tu-empresa.kommo.com`).
- **Credenciales API:** Acceso de administrador para generar el token OAuth2 o
  API Key.
- **Mapping de Campos:** El ID específico del campo de "Teléfono" en Kommo para
  asegurar la sincronización correcta.

### B. Zadarma (Telefonía IP)

- **API Key & Secret:** Llaves de acceso desde el panel de Zadarma
  (Configuración -> API).
- **ID de Identificador (Caller ID):** El número de teléfono registrado en
  Zadarma que se usará para realizar las llamadas de callback.

### C. Entorno n8n

- **Activación del Workflow:** Una vez cargadas las credenciales, se requiere el
  switch a modo "Active" para que el Webhook procese tráfico real.

---

## 3. Especificaciones de Validaciones Implementadas

El sistema ya cuenta con las siguientes protecciones nativas:

- **Timezone:** Configurado en `America/Mexico_City` para registro exacto de
  leads.
- **Normalización MX:** Transformación automática de cualquier formato de
  teléfono ingresado por el usuario al formato `52XXXXXXXXXX`.
- **Protocolo de Seguridad:** Respuesta 400 (Bad Request) ante intentos de spam
  o datos inválidos, protegiendo la base de datos del CRM.

---

**Nota:** Una vez proporcionadas las credenciales, el tiempo estimado para el
despliegue final es de **2 horas**, incluyendo pruebas de estrés y validación de
notificaciones.

---

_Este documento fue generado automáticamente por la unidad de AI Engineering de
Creastilo para el proyecto CASTO._

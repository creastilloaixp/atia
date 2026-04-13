---
name: agent-teams
description: Configuración y uso de equipos de múltiples agentes de IA en Claude Code. 
  Incluye: habilitar agent teams en claude.json, definir roles y responsabilidades, 
  establecer protocolos de comunicación entre agentes, escribir prompts efectivos para 
  equipos, debugging con tmux split view, control de calidad distribuido, y mejores prácticas.
  Activa cuando el usuario mencione: equipos de agentes, agent teams, múltiples agentes,
  subagentes, coordinated agents, parallel execution, agent collaboration, tmux view,
  división de trabajo entre IAs, roles de agentes, orchestration.
triggers:
  - equipos de agentes
  - agent teams
  - agent teams
  - múltiples agentes
  - subagentes
  - coordinated agents
  - parallel execution
  - agent collaboration
  - tmux split view
  - roles de agentes
  - orchestration
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Equipos de Agentes de Claude Code

## ¿Qué son los Agent Teams?

Los **Agent Teams** son un feature nativo de Claude Code que permite crear múltiples agentes de IA que:
- Trabajan **en paralelo**
- Se **comunicación entre sí**
- Realizan **controles de calidad mutuos**
- Comparten contexto y archivos del proyecto

## Cuándo Usar Equipos vs Subagentes

| **Equipos de Agentes** | **Subagentes** |
|-----------------------|----------------|
| Tareas complejas con diferentes especialidades | Tareas simples y repetitivas |
| Necesitas perspectiva múltiple | Solo necesitas ejecución básica |
| Control de calidad distribuido | Una persona hace todo |
| Proyectos multi-componente | tasks atómicos |

## Cómo Configurar Agent Teams

### Paso 1: Habilitar en claude.json

En la raíz del proyecto, agregar la configuración de agentes:

```json
{
  "agents": [
    {
      "name": "architect",
      "description": "Diseña la arquitectura y estructura del proyecto. Planifica la estructura de archivos, define patrones de diseño, y crea especificaciones técnicas."
    },
    {
      "name": "coder",
      "description": "Implementa el código según las especificaciones del architect. Escribe código limpio, funcional y bien documentado."
    },
    {
      "name": "reviewer",
      "description": "Revisa la calidad del código del coder. Verifica buenas prácticas, detecta bugs potenciales, y sugiere mejoras."
    },
    {
      "name": "tester",
      "description": "Escribe y ejecuta tests para validar la funcionalidad. Asegura cobertura adecuada y reproduce bugs reportados."
    }
  ]
}
```

### Paso 2: Escribir Prompts Efectivos para Equipos

Estructura recomendada:

```
Eres el orquestador de un equipo de agentes especializado en [tipo de proyecto].

Equipo:
- [Agent 1]: [rol específico y responsabilidades]
- [Agent 2]: [rol específico y responsabilidades]
- [Agent 3]: [rol específico y responsabilidades]

Protocolo de comunicación:
1. [Cómo se pasan información entre agentes]
2. [Cómo se da feedback]
3. [Cuándo termina cada agente]

Objetivo: [descripción clara del resultado esperado]

Tangibilidad: [criterios de éxito medibles]

Inicia coordinando al equipo para completar [tarea específica].
```

## Patrones de Comunicación entre Agentes

### Patrón 1: Sequential Handoff
```
Architect → Coder → Reviewer → Tester
```
Cada agente pasa su output al siguiente.

### Patrón 2: Parallel with Coordinator
```
      [Orquestador]
    ↙    ↓    ↘
[Agente1] [Agente2] [Agente3]
    ↘    ↓    ↙
      [Orquestador]
```
Todos trabajan en paralelo, el orquestador coordina.

### Patrón 3: Peer Review Circle
```
[Agente1] ↔ [Agente2]
    ↓         ↓
[Agente3] ↔ [Agente4]
```
Grupos pequeños que se revisan entre sí.

## Reglas Clave para Mejores Equipos

1. **No más de 3-4 agentes** - más crea confusión
2. **Un agente orquestador** que coordine y decide
3. **Cada agente hace UNA cosa bien** - responsabilidad única
4. **Feedback loop** - cada agente puede criticar constructivamente
5. **Exit criteria claros** - define cuándo termina cada agente
6. **Contexto compartido** - todos tienen acceso a la misma información del proyecto
7. **Roles no superpuestos** - evita duplicación de trabajo

## Errores Comunes y Soluciones

### Error 1: Duplicación de Trabajo
**Síntoma**: Dos agentes haciendo la misma tarea.
**Solución**: Definir claramente los límites de responsabilidad de cada agente.

### Error 2: Comunicación Caótica
**Síntoma**: Todos hablan con todos sin estructura.
**Solución**: Establecer un protocolo claro de comunicación con un orquestador.

### Error 3: Agentes sin Criterio de Fin
**Síntoma**: Agentes que trabajan infinitamente.
**Solución**: Definir exit criteria específicos para cada agente.

### Error 4: Sin Contexto Compartido
**Síntoma**: Agentes trabajando en aislado sin conocimiento del trabajo ajeno.
**Solución**: Asegurar que todos los agentes tengan acceso al contexto del proyecto.

## Debugging con tmux Split View

Para ver a cada agente pensando y trabajando en tiempo real:

1. Abrir múltiples paneles en tmux:
   ```bash
   tmux splitw -h  # panels horizontales
   ```

2. En cada panel, iniciar una sesión de Claude Code independiente

3. Asignar un agente específico a cada panel

4. Observar cómo cada agente procesa y responde en paralelo

## Ejemplo Completo: Equipo de Desarrollo Web

```json
{
  "agents": [
    {
      "name": "frontend-lead",
      "description": "Lidera la implementación del frontend. Coordina componentes React, estilos, y UX. Decide la estructura de componentes y libs a usar."
    },
    {
      "name": "backend-architect",
      "description": "Diseña y implementa la API y lógica del servidor. Define endpoints, esquemas de base de datos, y autenticación."
    },
    {
      "name": "qa-engineer",
      "description": "Verifica calidad del código, escribe tests, y reporta issues. Asegura que el código cumpla con los requisitos."
    },
    {
      "name": "devops",
      "description": "Maneja deployment, configuración de infraestructura, CI/CD, y monitoreo."
    }
  ]
}
```

Prompt de inicio:
```
Configura un equipo de agentes para construir una aplicación web completa.

Frontend Lead: Lidera React + Tailwind, decide estructura de componentes.
Backend Architect: API REST con Node.js, define esquema de DB.
QA Engineer: Tests E2E con Playwright, verifica funcionalidad.
DevOps: Dockerfile, docker-compose, CI/CD pipeline.

Objetivo: Crear una app de [descripción del proyecto] con:
- Autenticación de usuarios
- CRUD de recursos principales
- Dashboard con métricas básicas
- Despliegue en producción

Coordina al equipo para completar el desarrollo en sprints de 2 horas.
Reporta el progreso cada sprint.
```

## Recursos Externos

Para configuración avanzada, ver:
- [Referencia claude.json](https://docs.anthropic.com/en/docs/claude-code/agents)
- [Agent Teams Best Practices](https://docs.anthropic.com/en/docs/claude-code/teams)
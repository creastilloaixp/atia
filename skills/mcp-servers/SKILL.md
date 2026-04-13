---
name: mcp-servers
description: Configuración y uso de Model Context Protocol (MCP) servers en Claude Code.
  Incluye: qué es MCP, instalar servidores preconstruidos, crear servers personalizados,
  conectar herramientas externas (GitHub, PostgreSQL, filesystem), debugging de connections,
  y mejores prácticas de seguridad. Activa cuando el usuario mencione: MCP, model context
  protocol, mcp servers, external tools, integrations, custom tools, tool definitions,
  server configuration, api connections, database connections, github integration.
triggers:
  - mcp
  - model context protocol
  - mcp servers
  - mcp server
  - external tools
  - integrations
  - custom tools
  - tool definitions
  - server configuration
  - api connections
  - database connections
  - github integration
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Model Context Protocol (MCP) en Claude Code

## ¿Qué es MCP?

El **Model Context Protocol** es un protocolo estándar que permite a Claude Code conectar con herramientas y servicios externos de manera estructurada. MCP actúa como un "puente" entre el modelo de IA y:

- Bases de datos
- Repositorios de código
- APIs externas
- Sistemas de archivos
- Servicios cloud

## Estructura de un Servidor MCP

Un servidor MCP define **herramientas** que Claude Code puede invocar:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/ruta/proyecto"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost/db"]
    }
  }
}
```

## Instalación de Servidores Populares

### GitHub

```bash
npm install -g @modelcontextprotocol/server-github
```

Configuración en claude.json:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

Variables de entorno requeridas:
- `GITHUB_TOKEN`: Personal Access Token con permisos `repo`

### PostgreSQL

```bash
npm install -g @modelcontextprotocol/server-postgres
```

### Filesystem

```bash
npm install -y @modelcontextprotocol/server-filesystem
```

### Slack

```bash
npm install -g @modelcontextprotocol/server-slack
```

## Crear un Servidor MCP Personalizado

### Estructura Básica

```javascript
// my-mcp-server/index.js
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

const server = new Server({
  name: 'mi-servidor-custom',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'mi_herramienta',
        description: 'Descripción de qué hace esta herramienta',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string', description: 'Descripción del parámetro' }
          },
          required: ['param1']
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'mi_herramienta') {
    // Lógica de la herramienta
    return { content: [{ type: 'text', text: 'Resultado' }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Ejecutar Servidor

```bash
node my-mcp-server/index.js
```

## Configuración Avanzada

### Variables de Entorno Seguras

Nunca hardcodear tokens en claude.json:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Usar `.env` y cargar con `dotenv`:
```bash
export GITHUB_TOKEN=tu_token
```

### Múltiples Instancias

```json
{
  "mcpServers": {
    "producción": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://prod-host/db"]
    },
    "desarrollo": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://dev-host/db"]
    }
  }
}
```

## Debugging de Conexiones MCP

### Verificar Estado

```bash
# Listar herramientas disponibles
claude --print-tools
```

### Logs de Error

Los errores de MCP aparecen en la salida de Claude Code. Para mayor detalle:

```bash
claude --verbose
```

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| Token inválido | Verificar `GITHUB_TOKEN` en variables de entorno |
| Conexión rechazada | Verificar que el servidor esté corriendo |
| Herramienta no aparece | Verificar sintaxis en claude.json |
| Timeout | Aumentar timeout en configuración |

## Mejores Prácticas

1. **Principio de mínimo privilegio**: Solo pedir permisos necesarios
2. **Secrets fuera del código**: Usar variables de entorno, nunca hardcodear
3. **TypeScript para servers**: Mejor validación y autocompletion
4. **Testing**: Probar cada herramienta antes de integrar
5. **Documentar**: Añadir descripción clara a cada tool

## Recursos

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP Servers List](https://github.com/modelcontextprotocol/servers)
- [Spec MCP](https://spec.modelcontextprotocol.io)
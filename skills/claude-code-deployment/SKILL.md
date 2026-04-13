---
name: claude-code-deployment
description: Despliegue de Claude Code en servidor VPS propio. Incluye: configuración de 
  VPS (Hostinger, DigitalOcean, AWS), instalación de Node.js, configuración de seguridad,
  SSH, systemd services, nginx reverse proxy, SSL con Let's Encrypt, múltiples sesiones
  de Claude Code concurrently, y monitoreo básico.
  Activa en: deploy claude code, vps, self-hosted, server setup, ubuntu, ssh,
  systemd, nginx proxy, ssl certificate, remote server, cloud server, hostinger.
triggers:
  - deploy claude code
  - vps setup
  - self-hosted
  - server configuration
  - ubuntu server
  - ssh setup
  - nginx reverse proxy
  - ssl letsencrypt
  - cloud server
  - remote execution
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Despliegue de Claude Code en VPS

## Proveedores Recomendados

| Proveedor | Plan mínimo | Link |
|-----------|-------------|------|
| **Hostinger** | VPS KVM 2GB RAM | hostinger.com/vps/claude- (10% descuento) |
| **DigitalOcean** | Droplet $4/mes | digitalocean.com |
| **AWS** | t3.micro free tier | aws.amazon.com |

## Configuración Inicial del Servidor

### 1. Conexión SSH

```bash
# Generar clave SSH local
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Copiar clave al servidor
ssh-copy-id usuario@tu-ip-servidor

# Conexión básica
ssh usuario@tu-ip-servidor
```

### 2. Actualizar sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx
```

### 3. Instalar Node.js

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # v20.x.x
npm --version
```

## Instalar Claude Code

### Método 1: Instalación básica

```bash
# Crear usuario para Claude (recomendado)
sudo adduser claude
sudo usermod -aG sudo claude

# Cambiar al usuario
su - claude

# Instalar Claude Code
npm install -g @anthropic-ai/claude-code

# Verificar
claude --version
```

### Método 2: Con soporte de terminal interactiva

```bash
# Instalar dependencias adicionales
sudo apt install -y tmux screen

# Para interacción completa, usa tmux
tmux new -s claude
claude
# Presiona Ctrl+b d para detach
# Para reattach: tmux attach -t claude
```

## Configuración como Servicio systemd

### Crear servicio

```bash
sudo nano /etc/systemd/system/claude-code.service
```

```ini
[Unit]
Description=Claude Code CLI Service
After=network.target

[Service]
Type=simple
User=claude
WorkingDirectory=/home/claude
ExecStart=/usr/local/bin/claude
Restart=always
RestartSec=10
Environment="HOME=/home/claude"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

### Activar servicio

```bash
sudo systemctl daemon-reload
sudo systemctl enable claude-code.service
sudo systemctl start claude-code.service
sudo systemctl status claude-code.service
```

## Configuración de Nginx como Proxy

### Crear configuración

```bash
sudo nano /etc/nginx/sites-available/claude-remote
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Habilitar sitio

```bash
sudo ln -s /etc/nginx/sites-available/claude-remote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL con Let's Encrypt

```bash
# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renewal automático (certbot configura esto)
sudo certbot renew --dry-run
```

## Configurar Múltiples Sesiones

### Con tmux para múltiples usuarios

```bash
# Crear sesión por usuario
tmux new-session -d -s usuario1 "claude"
tmux new-session -d -s usuario2 "claude"

# Listar sesiones
tmux ls

# Conectar a sesión
tmux attach -t usuario1
```

### Script de gestión

```bash
#!/bin/bash
# /home/claude/scripts/manage-sessions.sh

case "$1" in
  start)
    tmux new-session -d -s dev "cd ~/projects && claude"
    tmux new-session -d -s ops "claude"
    echo "Sesiones iniciadas"
    ;;
  stop)
    tmux kill-session -t dev
    tmux kill-session -t ops
    echo "Sesiones terminadas"
    ;;
  status)
    tmux ls
    ;;
  *)
    echo "Uso: $0 {start|stop|status}"
    exit 1
    ;;
esac
```

## Monitoreo y Logs

### Ver logs de systemd

```bash
# Logs del servicio
sudo journalctl -u claude-code -f

# Logs anteriores
sudo journalctl -u claude-code --since "1 hour ago"
```

### Monitoreo con Prometheus (opcional)

```bash
# Instalar node_exporter
sudo apt install prometheus-node-exporter

# Agregar al crontab para métricas
crontab -e
# */5 * * * * curl -s localhost:9100/metrics > /var/www/html/metrics.html
```

## Configuración de Seguridad

### Firewall básico

```bash
# Instalar ufw
sudo apt install -y ufw

# Configurar reglas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar
sudo ufw enable
```

### Actualizaciones automáticas

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Resumen de Comandos

| Acción | Comando |
|--------|---------|
| Conexión SSH | `ssh usuario@ip` |
| Instalar Claude | `npm install -g @anthropic-ai/claude-code` |
| Iniciar servicio | `sudo systemctl start claude-code` |
| Ver logs | `sudo journalctl -u claude-code -f` |
| Reiniciar | `sudo systemctl restart claude-code` |
| SSL | `sudo certbot --nginx -d dominio.com` |
| Estado firewall | `sudo ufw status` |

## Notas Importantes

1. **Costos**: Hostinger ofrece 10% descuento con código NATEHERK
2. **Recursos**: Mínimo 2GB RAM para uso comfortable
3. **Seguridad**: Siempre usar SSH keys, no password
4. **Backup**: Configurar snapshots periódicos

---

**Referencia**: Para uso avanzado, considera Docker + n8n self-hosted en el mismo VPS.
#!/usr/bin/env node
/**
 * browser.cjs — Chrome DevTools Protocol controller
 * Usage: node scripts/browser.cjs <command> [args...]
 *
 * Commands:
 *   list                        - List open tabs
 *   navigate <url> [tabIndex]   - Navigate to URL
 *   content [tabIndex]          - Get page text content
 *   html [tabIndex]             - Get page HTML
 *   title [tabIndex]            - Get page title
 *   screenshot [tabIndex]       - Take screenshot (saves PNG)
 *   click <selector> [tabIndex] - Click element by CSS selector
 *   evaluate <expr> [tabIndex]  - Evaluate JavaScript expression
 *
 * Requires: Chrome running with --remote-debugging-port=9222
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_HOST = process.env.CDP_HOST || 'localhost';
const CDP_PORT = process.env.CDP_PORT || 9222;

// ===== HTTP helpers =====
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ===== WebSocket (minimal, no deps) =====
class SimpleWebSocket {
  constructor(url) {
    this.url = url;
    this.callbacks = {};
    this.msgId = 0;
    this.pendingResolves = {};
    this.buffer = Buffer.alloc(0);
  }

  connect() {
    return new Promise((resolve, reject) => {
      const parsed = new URL(this.url);
      const net = require('net');
      const crypto = require('crypto');

      const key = crypto.randomBytes(16).toString('base64');
      this.socket = net.createConnection(
        { host: parsed.hostname, port: parsed.port || 80 },
        () => {
          const req = [
            `GET ${parsed.pathname} HTTP/1.1`,
            `Host: ${parsed.host}`,
            `Upgrade: websocket`,
            `Connection: Upgrade`,
            `Sec-WebSocket-Key: ${key}`,
            `Sec-WebSocket-Version: 13`,
            '', ''
          ].join('\r\n');
          this.socket.write(req);
        }
      );

      let handshakeDone = false;
      this.socket.on('data', (chunk) => {
        if (!handshakeDone) {
          const str = chunk.toString();
          if (str.includes('101')) {
            handshakeDone = true;
            const bodyStart = str.indexOf('\r\n\r\n');
            if (bodyStart !== -1) {
              const remaining = chunk.slice(str.indexOf('\r\n\r\n') + 4);
              if (remaining.length > 0) {
                this._processData(remaining);
              }
            }
            resolve();
          } else {
            reject(new Error('WebSocket handshake failed'));
          }
        } else {
          this._processData(chunk);
        }
      });

      this.socket.on('error', reject);
      this.socket.on('close', () => {});
    });
  }

  _processData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length >= 2) {
      const firstByte = this.buffer[0];
      const secondByte = this.buffer[1];
      const masked = (secondByte & 0x80) !== 0;
      let payloadLen = secondByte & 0x7F;
      let offset = 2;

      if (payloadLen === 126) {
        if (this.buffer.length < 4) return;
        payloadLen = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (this.buffer.length < 10) return;
        payloadLen = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }

      if (masked) offset += 4;
      if (this.buffer.length < offset + payloadLen) return;

      let payload = this.buffer.slice(offset, offset + payloadLen);
      if (masked) {
        const maskKey = this.buffer.slice(offset - 4, offset);
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskKey[i % 4];
        }
      }

      this.buffer = this.buffer.slice(offset + payloadLen);

      const opcode = firstByte & 0x0F;
      if (opcode === 1) { // text frame
        try {
          const msg = JSON.parse(payload.toString());
          if (msg.id && this.pendingResolves[msg.id]) {
            this.pendingResolves[msg.id](msg);
            delete this.pendingResolves[msg.id];
          }
        } catch (e) {}
      }
    }
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++this.msgId;
      this.pendingResolves[id] = resolve;
      const msg = JSON.stringify({ id, method, params });
      const payload = Buffer.from(msg);
      const mask = require('crypto').randomBytes(4);

      let header;
      if (payload.length < 126) {
        header = Buffer.alloc(6);
        header[0] = 0x81;
        header[1] = 0x80 | payload.length;
        mask.copy(header, 2);
      } else if (payload.length < 65536) {
        header = Buffer.alloc(8);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(payload.length, 2);
        mask.copy(header, 4);
      } else {
        header = Buffer.alloc(14);
        header[0] = 0x81;
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
        mask.copy(header, 10);
      }

      const masked = Buffer.alloc(payload.length);
      for (let i = 0; i < payload.length; i++) {
        masked[i] = payload[i] ^ mask[i % 4];
      }

      this.socket.write(Buffer.concat([header, masked]));
    });
  }

  close() {
    if (this.socket) this.socket.destroy();
  }
}

// ===== CDP Client =====
async function getTabs() {
  const data = await httpGet(`http://${CDP_HOST}:${CDP_PORT}/json`);
  return JSON.parse(data).filter(t => t.type === 'page');
}

async function connectTab(tabIndex = 0) {
  const tabs = await getTabs();
  if (tabs.length === 0) throw new Error('No tabs found. Is Chrome running with --remote-debugging-port=9222?');
  const tab = tabs[Math.min(tabIndex, tabs.length - 1)];
  const ws = new SimpleWebSocket(tab.webSocketDebuggerUrl);
  await ws.connect();
  return { ws, tab };
}

// ===== Commands =====
async function cmdList() {
  const tabs = await getTabs();
  const result = tabs.map((t, i) => ({
    index: i,
    title: t.title,
    url: t.url
  }));
  console.log(JSON.stringify(result, null, 2));
}

async function cmdNavigate(url, tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  await ws.send('Page.enable');
  await ws.send('Page.navigate', { url });
  // Wait for load
  await new Promise(r => setTimeout(r, 5000));
  const result = await ws.send('Runtime.evaluate', {
    expression: 'document.title'
  });
  console.log(JSON.stringify({
    status: 'navigated',
    url,
    title: result.result?.result?.value || 'unknown'
  }));
  ws.close();
}

async function cmdContent(tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Runtime.evaluate', {
    expression: `
      (function() {
        // Remove scripts, styles, iframes
        const clone = document.cloneNode(true);
        clone.querySelectorAll('script, style, iframe, noscript, svg').forEach(el => el.remove());
        let text = clone.body ? clone.body.innerText || clone.body.textContent : '';
        // Collapse whitespace
        text = text.replace(/\\n{3,}/g, '\\n\\n').trim();
        return text.substring(0, 50000);
      })()
    `,
    returnByValue: true
  });
  const text = result.result?.result?.value || 'No content';
  console.log(text);
  ws.close();
}

async function cmdHtml(tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Runtime.evaluate', {
    expression: 'document.documentElement.outerHTML.substring(0, 100000)',
    returnByValue: true
  });
  console.log(result.result?.result?.value || 'No HTML');
  ws.close();
}

async function cmdTitle(tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Runtime.evaluate', {
    expression: 'document.title',
    returnByValue: true
  });
  console.log(result.result?.result?.value || 'No title');
  ws.close();
}

async function cmdScreenshot(tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(result.result?.data || '', 'base64');
  const filePath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(JSON.stringify({ status: 'saved', path: filePath, size: buffer.length }));
  ws.close();
}

async function cmdClick(selector, tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Runtime.evaluate', {
    expression: `
      (function() {
        const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
        if (!el) return JSON.stringify({ error: 'Element not found: ${selector}' });
        el.click();
        return JSON.stringify({ clicked: el.tagName, text: el.textContent.trim().substring(0, 100) });
      })()
    `,
    returnByValue: true
  });
  console.log(result.result?.result?.value || '{"error":"eval failed"}');
  ws.close();
}

async function cmdEvaluate(expr, tabIndex = 0) {
  const { ws } = await connectTab(tabIndex);
  const result = await ws.send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true
  });
  const val = result.result?.result?.value;
  console.log(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
  ws.close();
}

// ===== Main =====
async function main() {
  const [,, command, ...args] = process.argv;

  if (!command) {
    console.error('Usage: node browser.cjs <command> [args...]');
    console.error('Commands: list, navigate, content, html, title, screenshot, click, evaluate');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'list': await cmdList(); break;
      case 'navigate': await cmdNavigate(args[0], parseInt(args[1]) || 0); break;
      case 'content': await cmdContent(parseInt(args[0]) || 0); break;
      case 'html': await cmdHtml(parseInt(args[0]) || 0); break;
      case 'title': await cmdTitle(parseInt(args[0]) || 0); break;
      case 'screenshot': await cmdScreenshot(parseInt(args[0]) || 0); break;
      case 'click': await cmdClick(args[0], parseInt(args[1]) || 0); break;
      case 'evaluate': await cmdEvaluate(args[0], parseInt(args[1]) || 0); break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }

  process.exit(0);
}

main();

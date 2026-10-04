const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || undefined; // undefined = all interfaces (phone/LAN access)
const DATA_FILE = path.join(__dirname, 'user_data.json');
const BACKUP_FILE = path.join(__dirname, 'user_data.json.bak');

// The only files the browser ever needs. Anything else is never served.
const PUBLIC_FILES = new Set([
  'index.html', 'app.js', 'styles.css', 'sw.js', 'manifest.json', 'icon.svg'
]);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = req.url.split('?')[0];

  // API: Host-side state persistence
  if (parsedUrl === '/api/state') {
    if (req.method === 'GET') {
      fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store'
        });
        res.end(err ? '{}' : data);
      });
      return;
    } else if (req.method === 'POST') {
      const MAX_BODY = 5 * 1024 * 1024; // 5 MB
      const chunks = [];
      let size = 0;
      let overflow = false;
      req.on('data', chunk => {
        if (overflow) return;
        size += chunk.length;
        if (size > MAX_BODY) {
          overflow = true;
          chunks.length = 0;
          res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8', 'Connection': 'close' });
          res.end(JSON.stringify({ success: false, error: 'Request body too large (max 5 MB)' }));
          return;
        }
        chunks.push(chunk);
      });
      req.on('error', () => {});
      req.on('end', () => {
        if (overflow) return;
        const body = Buffer.concat(chunks).toString('utf8');
        try {
          JSON.parse(body);
        } catch(parseErr) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
          return;
        }

        // Atomic write: write to temp file then rename
        const tempFile = path.join(__dirname, 'user_data.json.tmp.' + Date.now());
        fs.writeFile(tempFile, body, 'utf8', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }

          if (fs.existsSync(DATA_FILE)) {
            try {
              fs.copyFileSync(DATA_FILE, BACKUP_FILE);
            } catch(e){}
          }

          fs.rename(tempFile, DATA_FILE, (renameErr) => {
            if (renameErr) {
              try {
                fs.copyFileSync(tempFile, DATA_FILE);
                fs.unlinkSync(tempFile);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, error: null }));
                return;
              } catch(copyErr) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: copyErr.message }));
                return;
              }
            }
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({ success: true, error: null }));
          });
        });
      });
      return;
    }
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', 'Allow': 'GET, POST' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  // Static files: only serve the public PWA assets. Everything else in this
  // folder (user data, backups, .git, src/, build scripts, package files...)
  // is private and is never exposed.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' });
    res.end('405 Method Not Allowed');
    return;
  }

  let reqPath;
  try {
    reqPath = decodeURIComponent(parsedUrl);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const fileName = reqPath.slice(1);
  if (!PUBLIC_FILES.has(fileName)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('404 Not Found');
    return;
  }

  fs.readFile(path.join(__dirname, fileName), (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(fileName).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Close the other server or run with PORT=<number>.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

// Dual-stack listening (supports localhost IPv4, IPv6, 127.0.0.1).
// Set HOST=127.0.0.1 to block access from other devices on your network.
server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

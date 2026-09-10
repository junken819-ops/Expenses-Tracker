const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'user_data.json');
const BACKUP_FILE = path.join(__dirname, 'user_data.json.bak');

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
          'Cache-Control': 'no-cache'
        });
        res.end(err ? '{}' : data);
      });
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
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
  }

  // Never expose the local persistence file, backups, temporary write files,
  // or the development server source through the static file endpoint.
  if(/^\/(?:user_data\.json(?:\.bak|\.tmp\..*)?|server\.js)$/.test(parsedUrl)){
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('404 Not Found');
    return;
  }

  // Static File Serving with Strict Path Traversal Protection
  let reqPath = decodeURIComponent(parsedUrl);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(path.join(__dirname, reqPath));
  const rootDirWithSep = __dirname.endsWith(path.sep) ? __dirname : (__dirname + path.sep);

  if (!safePath.startsWith(rootDirWithSep) && safePath !== path.join(__dirname, 'index.html')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

// Dual-stack listening (supports localhost IPv4, IPv6, 127.0.0.1)
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

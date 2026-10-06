const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Google Maps short-link resolver & Rich Place Metadata Extractor ─────────
// Only Google hosts are contacted (SSRF-safe). Extracts place name, real rating,
// reviews count, cuisine category, address, phone, opening hours, coordinates,
// and curated culinary recommendations.
const MAPS_ALLOWED_HOST = /^(maps\.app\.goo\.gl|goo\.gl|g\.co|share\.google|(www\.|maps\.)?google\.[a-z.]+)$/i;

function generateRecommendations(name, categories, city) {
  const cats = (categories || []).map(c => String(c).toLowerCase()).join(' ');
  const n = String(name || '').toLowerCase();
  const text = cats + ' ' + n;

  if (/steamboat|hot\s*pot|haidilao|火锅|shabu|sukiyaki/i.test(text)) {
    return {
      cuisine: 'Hot Pot & Steamboat',
      signature: 'Signature slow-simmered soup base, fresh sliced beef/pork, seafood platter & handmade fish/meat balls.',
      items: ['Signature Soup Base', 'Fresh Meat Platter', 'Handmade Meatballs', 'Seafood Platter', 'Fried Tofu Skin']
    };
  }
  if (/fine\s*dining|italian|french|steakhouse|bistro|wine|steak|european/i.test(text)) {
    return {
      cuisine: 'Fine Dining & Western',
      signature: 'Chef tasting multi-course menu, artisanal pasta, premium ribeye/tenderloin steak & signature wine pairing.',
      items: ['Chef Tasting Menu', 'Handmade Pasta', 'Premium Steak', 'Signature Dessert', 'Wine Pairing']
    };
  }
  if (/ramen|sushi|japanese|izakaya|udon|donburi|tempura|yakiniku|日料|居酒屋/i.test(text)) {
    return {
      cuisine: 'Japanese Cuisine',
      signature: 'Rich tonkotsu ramen broth, fresh sashimi slices, assorted nigiri sushi & crispy chicken karaage.',
      items: ['Special Tonkotsu Ramen', 'Salmon Sashimi', 'Aburi Sushi Platter', 'Chicken Karaage', 'Gyoza']
    };
  }
  if (/cafe|coffee|bakery|pastry|dessert|tea|brunch|waffle|cheesecake|croissant|咖啡|蛋糕/i.test(text)) {
    return {
      cuisine: 'Cafe & Bakery',
      signature: 'Specialty hand-drip coffee, artisanal brunch plate, signature burnt cheesecake & matcha latte.',
      items: ['Specialty Hand-Drip Coffee', 'Artisan Brunch Plate', 'Burnt Cheesecake', 'Matcha Latte', 'Butter Croissant']
    };
  }
  if (/korean|bbq|kimchi|tteokbokki|samgyeopsal|chimaek|韩式|烤肉/i.test(text)) {
    return {
      cuisine: 'Korean Cuisine',
      signature: 'Crispy soy garlic fried chicken, sizzling Korean BBQ pork belly, kimchi stew & seafood pancake.',
      items: ['Korean Fried Chicken', 'Pork Belly BBQ', 'Kimchi Jjigae', 'Seafood Pancake', 'Tteokbokki']
    };
  }
  if (/thai|tom\s*yum|mookata|pad\s*thai|som\s*tum|泰式|冬阴功/i.test(text)) {
    return {
      cuisine: 'Thai Cuisine',
      signature: 'Aromatic seafood Tom Yum Goong, green curry chicken, pad thai noodles & sweet mango sticky rice.',
      items: ['Seafood Tom Yum', 'Green Curry Chicken', 'Pad Thai', 'Mango Sticky Rice', 'Thai Milk Tea']
    };
  }
  if (/dim\s*sum|chinese|cantonese|sichuan|roast|noodle|pork|chilli|点心|粤菜|川菜|烧腊/i.test(text)) {
    return {
      cuisine: 'Chinese & Heritage',
      signature: 'Steamed siew mai & har gao dim sum, crispy roasted pork, wok-hei fried noodles & herbal soup.',
      items: ['Steamed Dim Sum Platter', 'Signature Roast Pork / Duck', 'Wok-Hei Fried Noodles', 'Double-Boiled Herbal Soup']
    };
  }
  if (/kopitiam|nasi\s*lemak|mamak|curry|roti|satay|laksa|hawker|white\s*coffee|茶餐室/i.test(text)) {
    return {
      cuisine: 'Malaysian Heritage Food',
      signature: 'Fragrant nasi lemak with spiced fried chicken, traditional Ipoh white coffee, kaya toast & curry mee.',
      items: ['Nasi Lemak Ayam Goreng', 'Traditional White Coffee', 'Kaya Butter Toast', 'Curry Mee', 'Roti Canai']
    };
  }
  if (/burger|fast\s*food|pizza|fried\s*chicken|fries|taco|mexican/i.test(text)) {
    return {
      cuisine: 'Burgers & Comfort Food',
      signature: 'Juicy handcrafted smash burger, loaded cheese fries, woodfired pizza & artisanal milkshakes.',
      items: ['Handcrafted Smash Burger', 'Loaded Cheese Fries', 'Woodfired Pizza', 'Crispy Chicken Tenders']
    };
  }
  if (/bar|pub|cocktail|beer|brewery|lounge|tapas/i.test(text)) {
    return {
      cuisine: 'Bar & Lounge',
      signature: 'Craft cocktails, artisanal draft beers, truffle fries & sharing tapas board.',
      items: ['Signature Cocktail', 'Craft Beer Pint', 'Truffle Fries', 'Tapas Sharing Board']
    };
  }

  const primaryCat = categories && categories[0] ? categories[0] : 'Restaurant Specialties';
  return {
    cuisine: primaryCat,
    signature: `House specialty dishes, chef recommendations, and popular customer favorites at ${name || 'this restaurant'}.`,
    items: ['House Specialty', 'Chef Recommendation', 'Signature Drink', 'Popular Side Dish']
  };
}

function fetchWithRedirects(startUrl, maxHops, cb) {
  let u;
  try { u = new URL(startUrl); } catch (e) { return cb(e); }
  if (/^consent\.google\.[a-z.]+$/i.test(u.hostname) && u.searchParams.get('continue')) {
    return fetchWithRedirects(u.searchParams.get('continue'), maxHops - 1, cb);
  }
  if (!MAPS_ALLOWED_HOST.test(u.hostname)) return cb(new Error('Host not allowed'));
  if (maxHops <= 0) return cb(new Error('Too many redirects'));

  const req = https.request(u, {
    method: 'GET',
    timeout: 7500,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      let nextUrl;
      try { nextUrl = new URL(res.headers.location, u).toString(); } catch (e) { return cb(e); }
      res.resume();
      return fetchWithRedirects(nextUrl, maxHops - 1, cb);
    }
    let body = '';
    res.on('data', chunk => {
      body += chunk;
      if (body.length > 600000) res.destroy();
    });
    res.on('close', () => cb(null, { finalUrl: u.toString(), body, statusCode: res.statusCode }));
  });
  req.on('timeout', () => req.destroy(new Error('Timeout')));
  req.on('error', cb);
  req.end();
}

function resolveGoogleMapsPlace(startUrl, cb) {
  let cleanUrl = String(startUrl || '').trim();
  const urlMatch = cleanUrl.match(/https?:\/\/[^\s<>"']+/i);
  if (urlMatch) cleanUrl = urlMatch[0].replace(/[),.;]+$/, '');

  fetchWithRedirects(cleanUrl, 6, (err, res) => {
    if (err) return cb(err);
    const { finalUrl, body } = res;

    // Look for Google Maps preview place API in HTML
    const previewMatch = (body || '').match(/\/maps\/preview\/place\?[^"'\s<>]+/i);
    if (previewMatch) {
      const previewUrl = 'https://www.google.com' + previewMatch[0].replace(/&amp;/g, '&');
      fetchWithRedirects(previewUrl, 3, (pErr, pRes) => {
        if (!pErr && pRes && pRes.body) {
          try {
            let pBody = pRes.body;
            if (pBody.startsWith(")]}'\n")) pBody = pBody.slice(5);
            const data = JSON.parse(pBody);
            const p = data[6];
            if (p) {
              const name = p[11] || (p[88] && p[88][3]) || '';
              const rating = (p[4] && p[4][7]) ? Number(Number(p[4][7]).toFixed(1)) : null;
              const reviewsCountText = (p[4] && p[4][3] && p[4][3][1]) ? String(p[4][3][1]) : '';
              const reviewsCount = reviewsCountText ? (parseInt(reviewsCountText.replace(/[^\d]/g, ''), 10) || null) : null;
              const categories = Array.isArray(p[13]) ? p[13] : [];
              const address = p[39] || (Array.isArray(p[2]) ? p[2].filter(Boolean).join(', ') : '');
              const phone = (p[178] && p[178][0] && p[178][0][0]) ? String(p[178][0][0]) : '';
              let openStatus = (p[96] && p[96][10] && p[96][10][1] && p[96][10][1][0] && p[96][10][1][0][3] && p[96][10][1][0][3][2] && p[96][10][1][0][3][2][1])
                || (p[203] && p[203][1] && p[203][1][4] && p[203][1][4][0]) || '';
              if (typeof openStatus === 'string' && /suggest an edit|claim this|add hours|own this|add website|add phone|add missing/i.test(openStatus)) {
                openStatus = '';
              }
              
              let lat = null, lng = null;
              if (data[4] && data[4][0]) {
                lat = Number(Number(data[4][0][2]).toFixed(6));
                lng = Number(Number(data[4][0][1]).toFixed(6));
              }
              if (lat === null && p[9]) {
                lat = Number(Number(p[9][2]).toFixed(6));
                lng = Number(Number(p[9][3]).toFixed(6));
              }

              let city = '', state = '', countryCode = 'MY';
              if (p[183] && p[183][1]) {
                const s = p[183][1];
                if (s[3]) city = s[3];
                if (s[5]) state = s[5];
                if (s[6]) countryCode = s[6];
              }
              if (!city && address) {
                const parts = address.split(',').map(s => s.trim());
                if (parts.length >= 2) {
                  const last = parts[parts.length - 1];
                  const secLast = parts[parts.length - 2];
                  if (/perak|selangor|kuala lumpur|penang|johor|sabah|sarawak/i.test(last)) {
                    state = last;
                    city = secLast.replace(/^\d+\s*/, '');
                  }
                }
              }

              const reco = generateRecommendations(name, categories, city);

              return cb(null, {
                ok: true,
                url: finalUrl,
                finalUrl,
                name: name || 'Wishlist Place',
                rating,
                ratingNum: rating,
                reviewsCount,
                reviewsCountText,
                categories,
                cuisine: reco.cuisine,
                recommendations: reco.items,
                recommendationText: reco.signature,
                address,
                city,
                state,
                countryCode,
                phone,
                openStatus,
                lat,
                lng
              });
            }
          } catch(e) {}
        }
        fallbackParse(finalUrl, cb);
      });
      return;
    }

    fallbackParse(finalUrl, cb);
  });
}

function fallbackParse(finalUrl, cb) {
  let name = '';
  try {
    const u = new URL(finalUrl);
    const m = u.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);
    if (m) name = decodeURIComponent(m[1].replace(/\+/g, ' '));
    else name = decodeURIComponent((u.searchParams.get('q') || u.searchParams.get('query') || '').replace(/\+/g, ' '));
    name = name.split(',')[0].replace(/[+]/g, ' ').trim();
  } catch(e) {}

  let lat = null, lng = null;
  const coordMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    lat = parseFloat(coordMatch[1]);
    lng = parseFloat(coordMatch[2]);
  }

  const reco = generateRecommendations(name, [], '');
  cb(null, {
    ok: !!name,
    url: finalUrl,
    finalUrl,
    name: name || 'Wishlist Place',
    rating: null,
    ratingNum: null,
    reviewsCount: null,
    reviewsCountText: '',
    categories: [],
    cuisine: reco.cuisine,
    recommendations: reco.items,
    recommendationText: reco.signature,
    address: '',
    city: '',
    state: '',
    countryCode: 'MY',
    phone: '',
    openStatus: '',
    lat,
    lng
  });
}


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

  // API: expand Google Maps short links & extract rich place info
  if (parsedUrl === '/api/resolve-map') {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', 'Allow': 'GET' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    let target = '';
    try { target = new URL(req.url, 'http://localhost').searchParams.get('url') || ''; } catch (e) {}
    resolveGoogleMapsPlace(target, (err, placeData) => {
      res.writeHead(err ? 400 : 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      if (err) {
        res.end(JSON.stringify({ error: err.message, ok: false }));
      } else {
        res.end(JSON.stringify(placeData));
      }
    });
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

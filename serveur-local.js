/* Serveur local : fichiers statiques + /api/chat (réutilise api/chat.js) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('./api/chat.js');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
    if (req.url.startsWith('/api/chat')) {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            let body = {};
            try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) { }
            const fauxRes = {
                setHeader: (k, v) => res.setHeader(k, v),
                status(code) { this.code = code; return this; },
                json(obj) { res.writeHead(this.code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }
            };
            handler({ method: req.method, body }, fauxRes);
        });
        return;
    }
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fichier = path.join(__dirname, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
    if (!fichier.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
    fs.readFile(fichier, (err, data) => {
        if (err) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fichier).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(8765, () => console.log('OK http://localhost:8765'));

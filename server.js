const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const publicDirectory = path.join(__dirname, 'public');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (request, response) => {
  const reply = (status, type, body, headers = {}) => {
    response.writeHead(status, {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(405, types['.txt'], 'Method not allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    reply(400, types['.txt'], 'Bad request');
    return;
  }

  const filename = path.resolve(publicDirectory, '.' + (pathname === '/' ? '/index.html' : pathname));
  const type = types[path.extname(filename)];
  if (!filename.startsWith(publicDirectory + path.sep) || !type) {
    reply(404, types['.txt'], 'Not found');
    return;
  }

  try {
    const file = await fs.readFile(filename);
    reply(200, type, file, { 'Content-Length': file.length });
  } catch (error) {
    const missing = ['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code);
    reply(missing ? 404 : 500, types['.txt'], missing ? 'Not found' : 'Server error');
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Life Below Water is ready at http://localhost:3000');
});

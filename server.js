require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const PORT = 3000;
const HOST = '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

const ai = process.env.GOOGLE_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  : null;

const systemInstruction = `
You are an educational ocean companion for the Under the Sea website.

Your mascot name is provided by the user.

YOUR PURPOSE:
- Teach users about oceans and marine life.
- Promote SDG 14: Life Below Water.
- Explain ocean-related topics in beginner-friendly language.
- When discussing Cebu, naturally connect the topic to marine conservation and SDG 14 when relevant.

TOPIC LIMITS:
- Only answer questions about oceans, marine life, marine conservation, and relevant Cebu topics.
- Politely redirect unrelated questions back to ocean-related topics.

RESPONSE STYLE:
- Use simple, beginner-friendly language.
- Keep answers around 3–5 sentences.
- Be friendly, informative, and accurate.
- Do not invent facts, statistics, or sources.
- Do not include unnecessary introductions.
- Give only the final answer.
`;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

function sendJSON(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });

  response.end(JSON.stringify(data));
}

function serveStaticFile(request, response) {
  let requestedPath;

  try {
    requestedPath = decodeURIComponent(
      new URL(request.url, `http://${HOST}:${PORT}`).pathname
    );
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  if (requestedPath === '/') {
    requestedPath = '/index.html';
  }

  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);

  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(PUBLIC_DIR + path.sep)
  ) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end('File Not Found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType,
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON request.'));
      }
    });

    request.on('error', reject);
  });
}

async function handleChat(request, response) {
  if (!ai) {
    return sendJSON(response, 500, {
      answer: 'The chatbot is not configured. Please check the server API key.',
    });
  }

  try {
    const body = await readRequestBody(request);

    const { messages, mascotName } = body;

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 10
    ) {
      return sendJSON(response, 400, {
        answer: 'Invalid conversation. Please try again.',
      });
    }

    const validMessages = messages.every((message) => {
      return (
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim().length >= 1 &&
        message.content.trim().length <= 700
      );
    });

    if (!validMessages) {
      return sendJSON(response, 400, {
        answer: 'Your message could not be processed. Please try again.',
      });
    }

    if (messages[messages.length - 1].role !== 'user') {
      return sendJSON(response, 400, {
        answer: 'Please send a message first.',
      });
    }

    const safeMascotName =
      typeof mascotName === 'string' &&
      /^[a-zA-Z0-9 -]{1,40}$/.test(mascotName)
        ? mascotName
        : 'Cobalt';

    const contents = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }],
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction:
          systemInstruction + `\nYour mascot name is ${safeMascotName}.`,
      },
    });

    const answer = result.text?.trim();

    if (!answer) {
      return sendJSON(response, 502, {
        answer: 'Sorry! I could not generate a response. Please try again.',
      });
    }

    return sendJSON(response, 200, { answer });

  } catch (error) {
    console.error('Gemini chatbot error:', error.message || error);

    const errorCode = error.status || error.code;

    if (Number(errorCode) === 503) {
      return sendJSON(response, 503, {
        answer: 'Gemini is currently busy. Please wait a moment and try again.',
      });
    }

    if (Number(errorCode) === 429) {
      return sendJSON(response, 429, {
        answer: 'The chatbot has reached its request limit. Please try again later.',
      });
    }

    if (Number(errorCode) === 401 || Number(errorCode) === 403) {
      return sendJSON(response, Number(errorCode), {
        answer: 'There is an API authentication issue. Please check the server configuration.',
      });
    }

    return sendJSON(response, 500, {
      answer: 'Sorry! Something went wrong. Please try again.',
    });
  }
}

const server = http.createServer((request, response) => {
  const pathname = new URL(
    request.url,
    `http://${HOST}:${PORT}`
  ).pathname;

  if (pathname === '/api/chat' && request.method === 'POST') {
    handleChat(request, response);
    return;
  }

  if (pathname.startsWith('/api/')) {
    sendJSON(response, 404, {
      answer: 'API endpoint not found.',
    });
    return;
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    serveStaticFile(request, response);
    return;
  }

  response.writeHead(405);
  response.end('Method Not Allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
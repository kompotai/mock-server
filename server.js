const fastify = require('fastify')({ logger: false });

const PORT = 4444;

// ── Helpers ──

function log(method, url, delay, status) {
  const ts = new Date().toLocaleTimeString();
  const delayStr = delay ? ` (delay ${delay}ms)` : '';
  console.log(`  ${ts}  ${method} ${url}${delayStr} → ${status}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Preset endpoints ──

// GET /contact — возвращает данные для создания контакта (задержка 2с)
fastify.get('/contact', async (request, reply) => {
  const delayMs = parseInt(request.query.delay) || 2000;
  await sleep(delayMs);

  const contact = {
    firstName: 'Алексей',
    lastName: 'Петров',
    email: 'alexey.petrov@example.com',
    phone: '+7 912 345-67-89',
    company: 'ООО Технологии',
    position: 'Директор по развитию',
    source: 'mock-server',
  };

  log('GET', '/contact', delayMs, 200);
  reply.send(contact);
});

// GET /contacts — возвращает массив контактов
fastify.get('/contacts', async (request, reply) => {
  const delayMs = parseInt(request.query.delay) || 1000;
  await sleep(delayMs);

  const contacts = [
    {
      firstName: 'Алексей',
      lastName: 'Петров',
      email: 'alexey.petrov@example.com',
      phone: '+7 912 345-67-89',
      company: 'ООО Технологии',
    },
    {
      firstName: 'Мария',
      lastName: 'Иванова',
      email: 'maria.ivanova@example.com',
      phone: '+7 903 111-22-33',
      company: 'ЗАО Инновации',
    },
    {
      firstName: 'Дмитрий',
      lastName: 'Сидоров',
      email: 'dmitry.sidorov@example.com',
      phone: '+7 916 444-55-66',
      company: 'ИП Сидоров',
    },
  ];

  log('GET', '/contacts', delayMs, 200);
  reply.send(contacts);
});

// ── Catch-all: any method, any path ──
// Query params:
//   ?delay=2000    — задержка в мс перед ответом
//   ?status=500    — HTTP статус ответа
//   ?body={"ok":1} — тело ответа (JSON строка)

fastify.all('/*', async (request, reply) => {
  const { delay, status, body } = request.query;
  const delayMs = parseInt(delay) || 0;
  const statusCode = parseInt(status) || 200;

  if (delayMs > 0) {
    await sleep(delayMs);
  }

  // Default response
  let responseBody = {
    ok: true,
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: request.body || null,
    query: request.query,
    timestamp: new Date().toISOString(),
    delay: delayMs || undefined,
  };

  // Custom body override
  if (body) {
    try {
      responseBody = JSON.parse(body);
    } catch {
      responseBody = { message: body };
    }
  }

  log(request.method, request.raw.url, delayMs, statusCode);

  reply.status(statusCode).send(responseBody);
});

// ── Start ──

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`\n  Mock HTTP Server running on http://localhost:${PORT}\n`);
  console.log('  Endpoints:');
  console.log(`    GET  http://localhost:${PORT}/contact          — 1 контакт (объект)`);
  console.log(`    GET  http://localhost:${PORT}/contacts         — 3 контакта (массив)`);
  console.log(`    GET  http://localhost:${PORT}/contact?delay=5000 — с задержкой\n`);
  console.log('  Generic:');
  console.log('    Any method, any path — echoes request back');
  console.log('    ?delay=2000  — задержка ответа');
  console.log('    ?status=500  — статус ответа\n');
});

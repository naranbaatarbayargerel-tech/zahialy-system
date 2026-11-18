const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const { serviceProxy } = require('../src/services/proxy.service');

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

test('proxy retries reads, forwards writes once, and returns decompressed bodies', async t => {
  const counts = {};
  const upstream = http.createServer((req, res) => {
    counts[req.url] = (counts[req.url] || 0) + 1;
    req.resume();
    if (req.url === '/compressed') {
      res.writeHead(200, { 'content-encoding': 'gzip', 'content-type': 'application/json' });
      return res.end(zlib.gzipSync('{"ok":true}'));
    }
    res.writeHead(counts[req.url] === 1 ? 503 : 200);
    res.end('response');
  });
  t.after(() => upstream.close());
  const target = await listen(upstream);
  const proxy = serviceProxy(target, { retryDelayMs: 1 });
  const gateway = http.createServer((req, res) => {
    req.originalUrl = req.url;
    res.status = code => { res.statusCode = code; return res; };
    res.send = body => res.end(body);
    res.json = value => res.end(JSON.stringify(value));
    proxy(req, res);
  });
  t.after(() => gateway.close());
  const base = await listen(gateway);

  const read = await fetch(`${base}/read`);
  assert.equal(read.status, 200);
  await read.text();
  assert.equal(counts['/read'], 2);

  const write = await fetch(`${base}/write`, { method: 'POST', body: '{}' });
  assert.equal(write.status, 503);
  await write.text();
  assert.equal(counts['/write'], 1);

  const compressed = await fetch(`${base}/compressed`);
  assert.equal(compressed.headers.get('content-encoding'), null);
  assert.deepEqual(await compressed.json(), { ok: true });
});

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const env = { FINNHUB_API_KEY: 'test-finnhub-secret', POLYGON_API_KEY: 'test-polygon-secret', ALPHA_VANTAGE_API_KEY: 'test-alpha-secret' };
let calls = [];
let failure = false;
const source = fs.readFileSync('src/app/api/proxy/route.ts', 'utf8');
const exportsObject = {};
const context = {
  exports: exportsObject,
  require: () => ({ NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } }),
  URL, AbortSignal, process: { env }, console: { log() {}, error() {} },
  setTimeout: (fn) => fn(),
  fetch: async (url, options) => {
    calls.push({ url: new URL(url), options });
    if (failure) throw new Error(`Network failure with ${env.FINNHUB_API_KEY}`);
    return { ok: true, status: 200, json: async () => ({ price: 100, reflectedUrl: url }) };
  },
};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const request = (url) => ({ url: 'http://localhost/api/proxy?url=' + encodeURIComponent(url) });
(async () => {
  let result = await exportsObject.GET(request('https://finnhub.io/api/v1/quote?symbol=AAPL&token=old'));
  assert.equal(result.status, 200);
  assert.equal(calls[0].url.searchParams.get('token'), env.FINNHUB_API_KEY);
  assert.equal(calls[0].options.redirect, 'error');
  assert(!JSON.stringify(result).includes(env.FINNHUB_API_KEY));
  for (const url of ['http://finnhub.io/api/v1/quote', 'https://finnhub.io:444/api/v1/quote', 'https://user@finnhub.io/api/v1/quote', 'https://finnhub.io/redirect']) {
    const before = calls.length;
    assert.equal((await exportsObject.GET(request(url))).status, 400);
    assert.equal(calls.length, before);
  }
  await exportsObject.GET(request('https://example.com/api'));
  assert(!calls.at(-1).url.toString().includes('test-'));
  await exportsObject.GET(request('https://api.polygon.io/v2/aggs/ticker/SPY/prev?apikey=old&apiKey=old2'));
  assert.equal(calls.at(-1).url.searchParams.get('apiKey'), env.POLYGON_API_KEY);
  assert.equal(calls.at(-1).url.searchParams.has('apikey'), false);
  delete env.POLYGON_API_KEY;
  assert.equal((await exportsObject.GET(request('https://api.polygon.io/v2/aggs/ticker/SPY/prev'))).status, 503);
  failure = true;
  result = await exportsObject.GET(request('https://finnhub.io/api/v1/quote?symbol=AAPL'));
  assert.equal(result.status, 503);
  assert(!JSON.stringify(result).includes(env.FINNHUB_API_KEY));
  for (const file of ['src/data/templates.ts', 'src/lib/premium-widgets.ts']) {
    const text = fs.readFileSync(file, 'utf8');
    assert(!text.includes('NEXT_PUBLIC_'));
    assert(!/[?&](token|apikey)=/.test(text));
  }
  failure = false;
  for (let i = 0; i < 35; i++) result = await exportsObject.GET(request('https://finnhub.io/api/v1/quote?symbol=AAPL'));
  assert.equal(result.status, 429);
  assert(calls[0].options.signal instanceof AbortSignal);
  console.log('PASS: server credential injection, origin/endpoint validation, redirects, errors and client configuration');
})().catch((error) => { console.error(error); process.exitCode = 1; });

import { Writable } from 'node:stream';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { REDACTED, redactLogLine } from './lib/redact';

describe('redactLogLine', () => {
  const redact = (obj: unknown) => JSON.parse(redactLogLine(JSON.stringify(obj)));

  it('redacts any field whose name matches /pan/i, at any depth', () => {
    expect(redact({ pan: 'ABCDE1234F', user: { panEnc: 'x', panLast4: '234F', PAN: 'y' }, ok: 1 })).toEqual({
      pan: REDACTED,
      user: { panEnc: REDACTED, panLast4: REDACTED, PAN: REDACTED },
      ok: 1,
    });
  });

  it('masks PAN-shaped strings inside other fields', () => {
    expect(redact({ msg: 'lookup for abcde1234f failed', url: '/x?p=ABCDE1234F' })).toEqual({
      msg: `lookup for ${REDACTED} failed`,
      url: `/x?p=${REDACTED}`,
    });
  });

  it('leaves non-JSON lines readable while masking PANs', () => {
    expect(redactLogLine('plain ABCDE1234F text')).toBe(`plain ${REDACTED} text`);
  });
});

describe('logging', () => {
  it('never writes a PAN to the log stream', async () => {
    const lines: string[] = [];
    const stream = new Writable({
      write(chunk, _enc, cb) {
        lines.push(chunk.toString());
        cb();
      },
    });
    const app = buildApp({ logger: { level: 'info', stream } });
    app.get('/echo', async (req) => {
      req.log.info({ pan: 'ABCDE1234F', body: { savedPan: 'ABCDE1234F' } }, 'saving ABCDE1234F');
      return { ok: true };
    });
    await app.ready();
    await request(app.server).get('/echo?pan=ABCDE1234F').expect(200);
    await app.close();

    const output = lines.join('');
    expect(output).toContain('saving');
    expect(output).not.toMatch(/ABCDE1234F/i);
  });
});

describe('rate limiting', () => {
  it('returns 429 with a JSON body after the limit on /v1 routes, but never limits /health', async () => {
    const app = buildApp({ logger: false, rateLimitMax: 2 });
    await app.ready();
    await request(app.server).get('/v1/registrars/KFIN').expect(200);
    await request(app.server).get('/v1/registrars/KFIN').expect(200);
    const res = await request(app.server).get('/v1/registrars/KFIN').expect(429);
    expect(res.body.error).toBe('TooManyRequests');
    await request(app.server).get('/health').expect(200);
    await app.close();
  });
});

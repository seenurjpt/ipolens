// Log redaction for PANs (SPEC: Backend API routes > Rules). Pino's built-in `redact` only
// takes fixed paths, so every log line is rewritten before it is written instead:
// - any field whose name matches /pan/i is replaced, whatever its depth;
// - anything shaped like a PAN inside a string (a URL, an error message) is masked.

const PAN_KEY = /pan/i;
const PAN_VALUE = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
export const REDACTED = '[REDACTED]';

function redactValue(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(PAN_VALUE, REDACTED);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, PAN_KEY.test(k) && v != null ? REDACTED : redactValue(v)]),
    );
  }
  return value;
}

/** Pino `hooks.streamWrite`: takes one serialised log line and returns it redacted. */
export function redactLogLine(line: string): string {
  try {
    return `${JSON.stringify(redactValue(JSON.parse(line)))}\n`;
  } catch {
    return line.replace(PAN_VALUE, REDACTED); // not JSON: mask what we can
  }
}

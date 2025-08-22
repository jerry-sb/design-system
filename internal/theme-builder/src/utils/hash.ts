import crypto from 'node:crypto';
export function sha256(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
}

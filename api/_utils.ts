export function generateId(prefix?: string) {
  return `${prefix || ''}${Math.random().toString(16).slice(2)}`;
}
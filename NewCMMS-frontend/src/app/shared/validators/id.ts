export function isNumericId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id >= 1;
}

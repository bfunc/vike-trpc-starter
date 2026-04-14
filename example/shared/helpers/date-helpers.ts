export function formatDate(isoString: string): string {
  return isoString.slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

// turn raw API errors (often JSON) into a message the user can act on
export function friendlyError(error: unknown, service: string): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/api[ _]?key|PERMISSION_DENIED|\b401\b|\b403\b/i.test(message)) {
    return `${service} rejected its API key. Check the key in the app's .env file.`;
  }
  if (/network|failed to fetch|timed? ?out/i.test(message)) {
    return `Couldn't reach ${service}. Check your internet connection and try again.`;
  }
  return `Something went wrong with ${service}. Please try again.`;
}

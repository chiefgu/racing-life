export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] | undefined };
  }
) => {
  // This will be called for all errors in the Next.js runtime
  // You can add custom error handling here if needed
  console.error('Request error:', err, request);
};

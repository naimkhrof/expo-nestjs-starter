const url = process.env.STARTER_API_URL ?? 'http://localhost:3001';
let lastError;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const info = await response.json();
    if (typeof info.name !== 'string' || !info.name) throw new Error('Missing API name');
    const docs = await fetch(`${url}/docs-json`, { signal: AbortSignal.timeout(2000) });
    if (!docs.ok || !(await docs.json()).openapi) throw new Error('Swagger is unavailable');
    console.log('API and Swagger smoke checks passed.');
    process.exit(0);
  } catch (error) {
    lastError = error;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
console.error(`API smoke check failed: ${lastError.message}`);
process.exit(1);

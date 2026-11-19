const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * En développement, `localhost` désigne l'appareil lui-même : un iPhone ou un
 * Android physique n'atteint donc pas l'API du Mac. On remplace alors l'hôte
 * par celui qui sert le bundle Metro (`hostUri`, ex. `192.168.1.50:8081`),
 * en gardant le port et le chemin de l'API. Hors dev, ou si l'URL configurée
 * n'est pas locale (preview, production), elle est renvoyée telle quelle.
 */
export function resolveApiUrl(
  configuredUrl: string | undefined,
  metroHostUri: string | null | undefined,
  isDev: boolean,
): string | undefined {
  if (!configuredUrl || !isDev || !metroHostUri) return configuredUrl;

  let url: URL;
  try {
    url = new URL(configuredUrl);
  }
  catch {
    return configuredUrl;
  }
  if (!LOOPBACK_HOSTS.has(url.hostname)) return configuredUrl;

  const metroHost = metroHostUri.replace(/^[a-z]+:\/\//i, '').split('/')[0].replace(/:\d+$/, '');
  if (!metroHost || LOOPBACK_HOSTS.has(metroHost)) return configuredUrl;

  url.hostname = metroHost;
  return url.toString().replace(/\/$/, configuredUrl.endsWith('/') ? '/' : '');
}

import { resolveApiUrl } from './resolve-api-url';

describe('resolveApiUrl', () => {
  it('remplace localhost par l\'hôte Metro sur un appareil physique en dev', () => {
    expect(resolveApiUrl('http://localhost:3001', '192.168.1.50:8081', true)).toBe(
      'http://192.168.1.50:3001',
    );
  });

  it('remplace aussi 127.0.0.1 et garde le chemin', () => {
    expect(resolveApiUrl('http://127.0.0.1:3001/v2/', 'exp://10.0.0.4:8081', true)).toBe(
      'http://10.0.0.4:3001/v2/',
    );
  });

  it('garde localhost quand Metro est lui-même local (simulateur, web)', () => {
    expect(resolveApiUrl('http://localhost:3001', 'localhost:8081', true)).toBe(
      'http://localhost:3001',
    );
    expect(resolveApiUrl('http://localhost:3001', undefined, true)).toBe('http://localhost:3001');
  });

  it('ne touche jamais une URL distante ni une build hors dev', () => {
    expect(resolveApiUrl('https://api.example.com', '192.168.1.50:8081', true)).toBe(
      'https://api.example.com',
    );
    expect(resolveApiUrl('http://localhost:3001', '192.168.1.50:8081', false)).toBe(
      'http://localhost:3001',
    );
  });
});

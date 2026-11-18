import ar from './ar.json';
import en from './en.json';

/** Chemins de toutes les feuilles d'un fichier de langue (`settings.theme.dark`). */
function keys(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('translations', () => {
  it('should have the same keys in every language file', () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it('should have no empty text', () => {
    for (const tree of [en, ar]) {
      const flat = JSON.stringify(tree);
      expect(flat).not.toContain('""');
    }
  });
});

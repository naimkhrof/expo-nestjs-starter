---
paths:
  - "apps/mobile/src/translations/*.json"
---
# Traductions

- Mêmes clés dans tous les fichiers de langue (test `translations.test.ts`) ; toute chaîne visible y est ajoutée dans chaque langue.
- La langue est lue une fois, au lancement : `I18nManager.forceRTL` ne vaut qu'au lancement suivant, `setLanguage` relance donc l'app.
- Avec une langue RTL, React Native retourne lui-même marges et rangées : ne retourner à la main que les icônes directionnelles.
- Arabe : six formes de pluriel (`zero`, `one`, `two`, `few`, `many`, `other`).

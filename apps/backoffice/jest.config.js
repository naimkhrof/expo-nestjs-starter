module.exports = {
  // Soupape : un test qui laisse un handle ouvert ne bloque plus Jest après la dernière suite.
  forceExit: true,
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Paquet de sources TypeScript : jest ne lit pas ses `exports`.
    '^@starter/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@starter/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
  },
};

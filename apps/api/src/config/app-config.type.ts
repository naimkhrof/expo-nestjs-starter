export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  corsOrigins: string[];
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  /** Mandataires de confiance devant l'API (0 en local, 1 par défaut en production). */
  trustProxy: number;
  /** Inscription et connexion sociale ouvertes à tous (`APP_PUBLIC_SIGNUP`). */
  publicSignup: boolean;
  /** Limite de débit globale : durée de la fenêtre (ms) et requêtes par adresse. */
  throttleTtl: number;
  throttleLimit: number;
};

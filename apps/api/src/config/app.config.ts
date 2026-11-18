import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '.././utils/validate-config';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  APP_CORS_ORIGINS: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  APP_TRUST_PROXY: number;

  @IsBooleanString()
  @IsOptional()
  APP_PUBLIC_SIGNUP: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  APP_THROTTLE_TTL_MS: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  APP_THROTTLE_LIMIT: number;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    corsOrigins: (
      process.env.APP_CORS_ORIGINS ||
      process.env.FRONTEND_DOMAIN ||
      '*'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    // Derrière le mandataire de l'hébergeur, l'adresse du client est celle
    // qu'il transmet : sans lui faire confiance, la limite de débit compterait
    // tout le monde sous une seule adresse.
    trustProxy: process.env.APP_TRUST_PROXY
      ? parseInt(process.env.APP_TRUST_PROXY, 10)
      : process.env.NODE_ENV === 'production'
        ? 1
        : 0,
    publicSignup: process.env.APP_PUBLIC_SIGNUP !== 'false',
    throttleTtl: process.env.APP_THROTTLE_TTL_MS
      ? parseInt(process.env.APP_THROTTLE_TTL_MS, 10)
      : 60_000,
    throttleLimit: process.env.APP_THROTTLE_LIMIT
      ? parseInt(process.env.APP_THROTTLE_LIMIT, 10)
      : 100,
  };
});

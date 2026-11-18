import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

/**
 * Ferme l'inscription par e-mail et la connexion par fournisseur social quand
 * `APP_PUBLIC_SIGNUP=false` : la route répond alors comme si elle n'existait
 * pas. Ouverte par défaut.
 */
@Injectable()
export class PublicSignupGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  canActivate(): boolean {
    if (!this.configService.get('app.publicSignup', { infer: true })) {
      throw new NotFoundException();
    }
    return true;
  }
}

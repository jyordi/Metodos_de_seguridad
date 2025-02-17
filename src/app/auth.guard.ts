import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      // Redirige al login si no está autenticado
      return this.router.parseUrl('/login');
    }
  }
}

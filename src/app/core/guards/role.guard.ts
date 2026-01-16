import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const requiredRoles: string[] = route.data['roles'] || [];

    // Si aucun rôle requis, autoriser l'accès
    if (requiredRoles.length === 0) {
      return true;
    }

    // Récupérer le rôle de l'utilisateur actuel
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role;

    if (userRole && requiredRoles.includes(userRole)) {
      return true;
    }

    console.warn(`Access denied: User role '${userRole}' not in required roles:`, requiredRoles);
    this.router.navigate(['/dashboard']);
    return false;
  }
}

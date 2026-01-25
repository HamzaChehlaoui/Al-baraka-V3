import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
    private readonly router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const requiredRoles: string[] = route.data['roles'] || [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role;

    if (userRole && requiredRoles.includes(userRole)) {
      return true;
    }

    console.warn(`Access denied: User role '${userRole}' not in required roles:`, requiredRoles);
    if (userRole === 'CLIENT') {
      this.router.navigate(['/client/dashboard']);
    } else if (userRole === 'AGENT') {
      this.router.navigate(['/agent/dashboard']);
    } else if (userRole === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}

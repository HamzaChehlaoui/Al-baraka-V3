import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="main-header">
      <div class="header-content">
        <div class="logo">
          <a routerLink="/" class="logo-link">
            <span class="logo-icon">🏦</span>
            <span class="logo-text">Al Baraka Digital</span>
          </a>
        </div>

        <nav class="main-nav" *ngIf="isAuthenticated">
          <!-- Navigation Client -->
          <ng-container *ngIf="userRole === 'CLIENT'">
            <a routerLink="/client" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
            <a routerLink="/client/deposit" routerLinkActive="active">Dépôt</a>
            <a routerLink="/client/withdrawal" routerLinkActive="active">Retrait</a>
            <a routerLink="/client/transfer" routerLinkActive="active">Virement</a>
            <a routerLink="/client/operations" routerLinkActive="active">Historique</a>
          </ng-container>

          <!-- Navigation Agent -->
          <ng-container *ngIf="userRole === 'AGENT'">
            <a routerLink="/agent" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
            <a routerLink="/agent/pending-operations" routerLinkActive="active">Opérations en Attente</a>
          </ng-container>

          <!-- Navigation Admin -->
          <ng-container *ngIf="userRole === 'ADMIN'">
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
            <a routerLink="/admin/users" routerLinkActive="active">Utilisateurs</a>
          </ng-container>
        </nav>

        <div class="header-actions">
          <ng-container *ngIf="isAuthenticated; else loginButton">
            <div class="user-menu">
              <span class="user-name">{{ userName }}</span>
              <span class="role-badge" [ngClass]="'role-' + userRole?.toLowerCase()">
                {{ userRole }}
              </span>
              <button (click)="logout()" class="btn-logout">
                Déconnexion
              </button>
            </div>
          </ng-container>
          <ng-template #loginButton>
            <a routerLink="/login" class="btn-login">Connexion</a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #fff;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .main-nav {
      display: flex;
      gap: 0.5rem;
    }

    .main-nav a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .main-nav a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    .main-nav a.active {
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name {
      color: #fff;
      font-size: 0.9rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.role-client {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #fff;
    }

    .role-badge.role-agent {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #fff;
    }

    .role-badge.role-admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .btn-logout {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .btn-login {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: transform 0.3s ease;
    }

    .btn-login:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
      }

      .main-nav {
        order: 3;
        width: 100%;
        overflow-x: auto;
        padding: 0.5rem 0;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userName: string = '';
  userRole: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user?.fullName || '';
      this.userRole = user?.role || '';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

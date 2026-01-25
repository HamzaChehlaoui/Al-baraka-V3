import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { OperationService } from '../../../core/services/operation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  totalUsers: number = 0;
  totalClients: number = 0;
  totalAgents: number = 0;
  pendingOperationsCount: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly operationService: OperationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers(0, 1).subscribe({
      next: (response: any) => {
        this.totalUsers = response.totalCount || 0;
      },
      error: (error: any) => {
        console.error('Erreur chargement utilisateurs:', error);
      }
    });

    this.userService.getUsers(0, 1, 'CLIENT').subscribe({
      next: (response: any) => {
        this.totalClients = response.totalCount || 0;
      },
      error: (error: any) => {
        console.error('Erreur chargement clients:', error);
      }
    });

    this.userService.getUsers(0, 1, 'AGENT').subscribe({
      next: (response: any) => {
        this.totalAgents = response.totalCount || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement agents:', error);
        this.isLoading = false;
      }
    });

    this.operationService.getPendingOperations(0, 10).subscribe({
      next: (response: any) => {
        this.pendingOperationsCount = response.totalCount || 0;
      },
      error: (error: any) => {
        console.error('Erreur chargement opérations:', error);
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

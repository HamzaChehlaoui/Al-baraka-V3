import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  currentUser: any = null;
  users: User[] = [];
  selectedUser: User | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  roleFilter: string = '';
  searchQuery: string = '';
  isLoading: boolean = false;
  actionInProgress: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        this.roleFilter = params['filter'];
      }
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.searchQuery) {
      this.userService.searchUsers(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          this.handleUsersResponse(response);
        },
        error: (error: any) => {
          this.handleError(error);
        }
      });
    } else {
      this.userService.getUsers(this.currentPage, this.pageSize, this.roleFilter || undefined).subscribe({
        next: (response: any) => {
          this.handleUsersResponse(response);
        },
        error: (error: any) => {
          this.handleError(error);
        }
      });
    }
  }

  private handleUsersResponse(response: any): void {
    // Handle UserListResponse format from service
    if (response?.users) {
      this.users = response.users;
      this.totalCount = response.totalCount || response.users.length;
    } else if (Array.isArray(response)) {
      this.users = response;
      this.totalCount = response.length;
    } else {
      this.users = [];
      this.totalCount = 0;
    }

    this.isLoading = false;
  }

  private handleError(error: any): void {
    console.error('Erreur chargement utilisateurs:', error);
    this.errorMessage = error.error?.message || 'Erreur lors du chargement des utilisateurs';
    this.isLoading = false;
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  activateUser(): void {
    if (!this.selectedUser) return;

    this.actionInProgress = true;
    this.userService.activateUser(this.selectedUser.id).subscribe({
      next: (response: any) => {
        this.actionInProgress = false;
        this.successMessage = `Utilisateur ${this.selectedUser?.fullName} activé avec succès`;
        this.loadUsers();
        this.closeModal();
      },
      error: (error: any) => {
        this.actionInProgress = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'activation';
      }
    });
  }

  deactivateUser(): void {
    if (!this.selectedUser) return;

    this.actionInProgress = true;
    this.userService.deactivateUser(this.selectedUser.id).subscribe({
      next: (response: any) => {
        this.actionInProgress = false;
        this.successMessage = `Utilisateur ${this.selectedUser?.fullName} désactivé`;
        this.loadUsers();
        this.closeModal();
      },
      error: (error: any) => {
        this.actionInProgress = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la désactivation';
      }
    });
  }

  suspendUser(): void {
    if (!this.selectedUser) return;

    this.actionInProgress = true;
    this.userService.suspendUser(this.selectedUser.id).subscribe({
      next: (response: any) => {
        this.actionInProgress = false;
        this.successMessage = `Utilisateur ${this.selectedUser?.fullName} suspendu`;
        this.loadUsers();
        this.closeModal();
      },
      error: (error: any) => {
        this.actionInProgress = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la suspension';
      }
    });
  }

  changeRole(newRole: string): void {
    if (!this.selectedUser) return;

    this.actionInProgress = true;
    this.userService.changeUserRole(this.selectedUser.id, newRole, this.selectedUser).subscribe({
      next: () => {
        this.actionInProgress = false;
        this.successMessage = `Rôle de ${this.selectedUser?.fullName} changé en ${newRole}`;
        this.loadUsers();
        this.closeModal();
      },
      error: (error: any) => {
        this.actionInProgress = false;
        if (error.error?.errors) {
          const errorMessages = Object.entries(error.error.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          this.errorMessage = errorMessages || error.error?.message || 'Erreur de validation';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors du changement de rôle';
        }
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.searchQuery = '';
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  getRoleClass(role: string): string {
    return `role-${role.toLowerCase()}`;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

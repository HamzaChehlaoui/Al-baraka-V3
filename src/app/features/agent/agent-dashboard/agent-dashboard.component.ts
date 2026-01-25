import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OperationService } from '../../../core/services/operation.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {
  currentUser: any = null;
  pendingOperationsCount: number = 0;
  totalProcessedToday: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Statistiques détaillées
  pendingDeposits: number = 0;
  pendingWithdrawals: number = 0;
  pendingTransfers: number = 0;
  recentPendingOperations: any[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly operationService: OperationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAgentData();
  }

  loadAgentData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger les opérations en attente
    this.operationService.getPendingOperations(0, 10).subscribe({
      next: (response: any) => {
        const operations = response.operations || [];
        this.pendingOperationsCount = response.totalCount || operations.length;
        this.recentPendingOperations = operations.slice(0, 5);

        // Calculer les statistiques par type
        this.pendingDeposits = operations.filter((op: any) => op.type === 'DEPOSIT').length;
        this.pendingWithdrawals = operations.filter((op: any) => op.type === 'WITHDRAWAL').length;
        this.pendingTransfers = operations.filter((op: any) => op.type === 'TRANSFER').length;

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement opérations:', error);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
      }
    });
  }

  getOperationTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'DEPOSIT': 'Dépôt',
      'WITHDRAWAL': 'Retrait',
      'TRANSFER': 'Virement'
    };
    return labels[type] || type;
  }

  getOperationTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'DEPOSIT': '💰',
      'WITHDRAWAL': '💸',
      'TRANSFER': '🔄'
    };
    return icons[type] || '📄';
  }

  getOperationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'DEPOSIT': 'fas fa-plus-circle',
      'WITHDRAWAL': 'fas fa-minus-circle',
      'TRANSFER': 'fas fa-exchange-alt'
    };
    return icons[type] || 'fas fa-file';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

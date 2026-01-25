import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OperationService, Operation } from '../../../../core/services/operation.service';

@Component({
  selector: 'app-operations-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operations-history.component.html',
  styleUrl: './operations-history.component.css'
})
export class OperationsHistoryComponent implements OnInit {
  operations: Operation[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;

  constructor(
    private operationService: OperationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOperations();
  }

  loadOperations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.operationService.getOperationHistory(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('✅ Operations received:', response);

        // Traiter la réponse selon son format
        let  operationsData: any[] = [];
        let totalCount: number = 0;

        if (Array.isArray(response)) {
          // Si la réponse est un array direct
          operationsData = response;
          totalCount = response.length;
        } else if (response.operations && Array.isArray(response.operations)) {
          // Si la réponse a une propriété operations
          operationsData = response.operations;
          totalCount = response.totalCount || response.operations.length;
        }

        // Transformer les données pour correspondre à l'interface Operation
        this.operations = operationsData.map((op: any) => ({
          ...op,
          createdAt: op.date || op.createdAt // Normaliser la date
        }));

        this.totalCount = totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error loading operations:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des opérations';
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

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOperations();
    }
  }

  nextPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.loadOperations();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}

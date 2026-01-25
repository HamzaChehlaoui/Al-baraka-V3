import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OperationService } from '../../../core/services/operation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Operation, DocumentDto } from '../../../core/models';

@Component({
  selector: 'app-pending-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pending-operations.component.html',
  styleUrl: './pending-operations.component.css'
})
export class PendingOperationsComponent implements OnInit {
  currentUser: any = null;
  pendingOperations: Operation[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedOperation: Operation | null = null;
  actionInProgress: boolean = false;
  currentPage: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  showDocumentViewer: boolean = false;
  documentUrl: string = '';
  selectedDocument: DocumentDto | null = null;
  rejectReason: string = '';
  showRejectModal: boolean = false;

  private readonly agentApiUrl = 'http://localhost:8080/api/agent';

  constructor(
    private readonly operationService: OperationService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingOperations();
  }

  getDocumentViewUrl(documentId: number): string {
    return `${this.agentApiUrl}/documents/${documentId}/view`;
  }

  getDocumentDownloadUrl(documentId: number): string {
    return `${this.agentApiUrl}/documents/${documentId}/download`;
  }

  openImageModal(document: DocumentDto): void {
    this.selectedDocument = document;
    this.showDocumentViewer = true;
  }

  loadPendingOperations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.operationService.getPendingOperations(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.pendingOperations = response;
          this.totalCount = response.length;
        } else {
          this.pendingOperations = response.operations || [];
          this.totalCount = response.totalCount || 0;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des opérations en attente';
      }
    });
  }

  selectOperation(operation: Operation): void {
    this.selectedOperation = operation;
    this.showRejectModal = false;
    this.rejectReason = '';
  }

  viewDocument(operation: Operation): void {
    if (operation.justificationDocumentUrl) {
      this.documentUrl = operation.justificationDocumentUrl;
      this.showDocumentViewer = true;
    }
  }

  closeDocumentViewer(): void {
    this.showDocumentViewer = false;
    this.documentUrl = '';
    this.selectedDocument = null;
  }

  approveOperation(): void {
    if (!this.selectedOperation) return;

    this.actionInProgress = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.operationService.approveOperation(this.selectedOperation.id, '').subscribe({
      next: (response: any) => {
        this.actionInProgress = false;
        this.successMessage = `Opération ${this.selectedOperation?.id} approuvée avec succès`;
        this.selectedOperation = null;
        this.loadPendingOperations();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        this.actionInProgress = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'approbation de l\'opération';
      }
    });
  }

  openRejectModal(): void {
    this.showRejectModal = true;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
  }

  rejectOperation(): void {
    if (!this.selectedOperation) return;
    if (!this.rejectReason.trim()) {
      this.errorMessage = 'Veuillez fournir une raison pour le rejet';
      return;
    }

    this.actionInProgress = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.operationService.rejectOperation(this.selectedOperation.id, this.rejectReason).subscribe({
      next: (response: any) => {
        this.actionInProgress = false;
        this.successMessage = `Opération ${this.selectedOperation?.id} rejetée`;
        this.selectedOperation = null;
        this.showRejectModal = false;
        this.rejectReason = '';
        this.loadPendingOperations();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        this.actionInProgress = false;
        this.errorMessage = error.error?.message || 'Erreur lors du rejet de l\'opération';
      }
    });
  }

  closeDetails(): void {
    this.selectedOperation = null;
    this.showRejectModal = false;
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

  getOperationClass(type: string): string {
    const classes: { [key: string]: string } = {
      'DEPOSIT': 'deposit',
      'WITHDRAWAL': 'withdrawal',
      'TRANSFER': 'transfer'
    };
    return classes[type] || '';
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPendingOperations();
    }
  }

  nextPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.loadPendingOperations();
    }
  }

  goBack(): void {
    this.router.navigate(['/agent']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}

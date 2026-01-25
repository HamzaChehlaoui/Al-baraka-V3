import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface DocumentDto {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface Operation {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  description: string;
  createdAt: string;
  updatedAt: string;
  accountNumber: string;
  recipientAccountNumber?: string;
  documents?: DocumentDto[];
  justificationDocumentUrl?: string;
}

export interface CreateOperationRequest {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  recipientAccountNumber?: string;
}

export interface OperationResponse {
  id: string;
  type: string;
  amount: number;
  status: string;
  message: string;
}

export interface OperationListResponse {
  operations: Operation[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly clientApiUrl = 'http://localhost:8080/api/client/operations';
  private readonly agentApiUrl = 'http://localhost:8080/api/agent/operations';
  private readonly agentBaseUrl = 'http://localhost:8080/api/agent';

  constructor(private readonly http: HttpClient) {}

  /**
   * Créer une opération (dépôt, retrait ou virement)
   */
  createOperation(operationType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER', amount: number, recipientAccountNumber?: string, description?: string): Observable<OperationResponse> {
    const request: CreateOperationRequest = {
      type: operationType,
      amount,
      currency: 'DH',
      description: description || '',
      recipientAccountNumber
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

  /**
   * Créer un nouveau dépôt
   */
  createDeposit(amount: number, currency: string = 'DH', description: string = ''): Observable<OperationResponse> {
    const request = {
      type: 'DEPOSIT',
      amount,
      currency,
      description
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

  /**
   * Créer un nouveau retrait
   */
  createWithdrawal(amount: number, currency: string = 'DH', description: string = ''): Observable<OperationResponse> {
    const request = {
      type: 'WITHDRAWAL',
      amount,
      currency,
      description
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

  /**
   * Créer un nouveau virement
   */
  createTransfer(recipientAccountNumber: string, amount: number, currency: string = 'DH', description: string = ''): Observable<OperationResponse> {
    const request = {
      type: 'TRANSFER',
      amount,
      currency,
      description,
      targetAccountNumber: recipientAccountNumber
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

  /**
   * Récupérer l'historique des opérations
   */
  getOperationHistory(pageNumber: number = 0, pageSize: number = 10): Observable<OperationListResponse> {
    return this.http.get<any>(this.clientApiUrl).pipe(
      map((response: any) => {
        console.log('Operation history response:', response);
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          const start = pageNumber * pageSize;
          return {
            operations: response.slice(start, start + pageSize),
            totalCount: response.length,
            pageNumber: pageNumber,
            pageSize: pageSize
          };
        }
        return {
          operations: response.operations || response.content || [],
          totalCount: response.totalCount || response.totalElements || 0,
          pageNumber: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }

  /**
   * Récupérer les détails d'une opération
   */
  getOperationDetails(operationId: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.clientApiUrl}/${operationId}`);
  }

  /**
   * Télécharger un justificatif pour une opération
   */
  uploadJustification(operationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.clientApiUrl}/${operationId}/document`, formData);
  }

  /**
   * Mapper une opération du backend vers le modèle frontend (for agent)
   */
  private mapOperationForAgent(op: any): Operation {
    // Get documents array from backend
    const documents: DocumentDto[] = op.documents || [];

    // Check if documents exist - set URL to view document via API
    let docUrl: string | undefined = undefined;
    if (documents.length > 0) {
      // Use the operation documents endpoint
      docUrl = `${this.agentApiUrl}/${op.id}/documents`;
    }

    return {
      id: op.id?.toString() || op.id,
      type: op.type,
      amount: op.amount,
      currency: op.currency || 'DH',
      status: op.status,
      description: op.description,
      createdAt: op.createdAt || op.date,
      updatedAt: op.updatedAt || op.date,
      accountNumber: op.accountNumber,
      recipientAccountNumber: op.recipientAccountNumber || op.targetAccountNumber,
      documents: documents,
      justificationDocumentUrl: docUrl
    };
  }

  /**
   * Mapper une opération du backend vers le modèle frontend (for client)
   */
  private mapOperation(op: any): Operation {
    // Get documents array from backend
    const documents: DocumentDto[] = op.documents || [];

    // Check if documents exist
    let docUrl: string | undefined = undefined;
    if (documents.length > 0) {
      docUrl = `${this.clientApiUrl}/${op.id}/documents`;
    }

    return {
      id: op.id?.toString() || op.id,
      type: op.type,
      amount: op.amount,
      currency: op.currency || 'DH',
      status: op.status,
      description: op.description,
      createdAt: op.createdAt || op.date,
      updatedAt: op.updatedAt || op.date,
      accountNumber: op.accountNumber,
      recipientAccountNumber: op.recipientAccountNumber || op.targetAccountNumber,
      documents: documents,
      justificationDocumentUrl: docUrl
    };
  }

  /**
   * Récupérer les opérations en attente d'approbation (pour Agent/Admin)
   */
  getPendingOperations(pageNumber: number = 0, pageSize: number = 10): Observable<OperationListResponse> {
    return this.http.get<any>(`${this.agentApiUrl}/pending`).pipe(
      map((response: any) => {
        console.log('Pending operations response:', response);
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          const mappedOps = response.map((op: any) => this.mapOperationForAgent(op));
          const start = pageNumber * pageSize;
          return {
            operations: mappedOps.slice(start, start + pageSize),
            totalCount: response.length,
            pageNumber: pageNumber,
            pageSize: pageSize
          };
        }
        const rawOps = response.operations || response.content || [];
        return {
          operations: rawOps.map((op: any) => this.mapOperationForAgent(op)),
          totalCount: response.totalCount || response.totalElements || 0,
          pageNumber: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }

  /**
   * Récupérer les détails d'une opération (Agent)
   */
  getOperationDetailsAgent(operationId: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.agentApiUrl}/${operationId}`);
  }

  /**
   * Approuver une opération (Agent/Admin)
   */
  approveOperation(operationId: string, comment: string = ''): Observable<OperationResponse> {
    return this.http.put<OperationResponse>(`${this.agentApiUrl}/${operationId}/approve`, { comment });
  }

  /**
   * Rejeter une opération (Agent/Admin)
   */
  rejectOperation(operationId: string, reason: string = ''): Observable<OperationResponse> {
    return this.http.put<OperationResponse>(`${this.agentApiUrl}/${operationId}/reject`, { reason });
  }
}

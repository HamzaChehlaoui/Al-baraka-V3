import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:8080/api/client/operations';

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
    return this.http.post<OperationResponse>(`${this.apiUrl}`, request);
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
    return this.http.post<OperationResponse>(`${this.apiUrl}`, request);
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
    return this.http.post<OperationResponse>(`${this.apiUrl}`, request);
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
    return this.http.post<OperationResponse>(`${this.apiUrl}`, request);
  }

  /**
   * Récupérer l'historique des opérations
   */
  getOperationHistory(pageNumber: number = 1, pageSize: number = 10): Observable<OperationListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OperationListResponse>(`${this.apiUrl}`, { params });
  }

  /**
   * Récupérer les détails d'une opération
   */
  getOperationDetails(operationId: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${operationId}`);
  }

  /**
   * Télécharger un justificatif pour une opération
   */
  uploadJustification(operationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${operationId}/justification`, formData);
  }

  /**
   * Récupérer les opérations en attente d'approbation (pour Agent/Admin)
   */
  getPendingOperations(pageNumber: number = 1, pageSize: number = 10): Observable<OperationListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OperationListResponse>(`${this.apiUrl}/pending`, { params });
  }

  /**
   * Approuver une opération (Agent/Admin)
   */
  approveOperation(operationId: string, comment: string = ''): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(`${this.apiUrl}/${operationId}/approve`, { comment });
  }

  /**
   * Rejeter une opération (Agent/Admin)
   */
  rejectOperation(operationId: string, reason: string = ''): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(`${this.apiUrl}/${operationId}/reject`, { reason });
  }
}

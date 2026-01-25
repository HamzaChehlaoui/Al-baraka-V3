import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  DocumentDto,
  Operation,
  CreateOperationRequest,
  OperationResponse,
  OperationListResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly clientApiUrl = 'http://localhost:8080/api/client/operations';
  private readonly agentApiUrl = 'http://localhost:8080/api/agent/operations';
  private readonly agentBaseUrl = 'http://localhost:8080/api/agent';

  constructor(private readonly http: HttpClient) {}

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

  createDeposit(amount: number, currency: string = 'DH', description: string = ''): Observable<OperationResponse> {
    const request = {
      type: 'DEPOSIT',
      amount,
      currency,
      description
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

  createWithdrawal(amount: number, currency: string = 'DH', description: string = ''): Observable<OperationResponse> {
    const request = {
      type: 'WITHDRAWAL',
      amount,
      currency,
      description
    };
    return this.http.post<OperationResponse>(`${this.clientApiUrl}`, request);
  }

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

  getOperationHistory(pageNumber: number = 0, pageSize: number = 10): Observable<OperationListResponse> {
    return this.http.get<any>(this.clientApiUrl).pipe(
      map((response: any) => {
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

  getOperationDetails(operationId: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.clientApiUrl}/${operationId}`);
  }

  uploadJustification(operationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.clientApiUrl}/${operationId}/document`, formData);
  }

  private mapOperationForAgent(op: any): Operation {
    const documents: DocumentDto[] = op.documents || [];
    let docUrl: string | undefined = undefined;
    if (documents.length > 0) {
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

  private mapOperation(op: any): Operation {
    const documents: DocumentDto[] = op.documents || [];
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

  getPendingOperations(pageNumber: number = 0, pageSize: number = 10): Observable<OperationListResponse> {
    return this.http.get<any>(`${this.agentApiUrl}/pending`).pipe(
      map((response: any) => {
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

  getOperationDetailsAgent(operationId: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.agentApiUrl}/${operationId}`);
  }

  approveOperation(operationId: string, comment: string = ''): Observable<OperationResponse> {
    return this.http.put<OperationResponse>(`${this.agentApiUrl}/${operationId}/approve`, { comment });
  }

  rejectOperation(operationId: string, reason: string = ''): Observable<OperationResponse> {
    return this.http.put<OperationResponse>(`${this.agentApiUrl}/${operationId}/reject`, { reason });
  }
}


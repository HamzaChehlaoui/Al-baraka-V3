import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AccountBalance {
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface AccountInfo {
  accountNumber: string;
  balance: number;
  currency: string;
  accountHolder: string;
  accountType: string;
  createdAt: string;
  status: string;
}

export interface RecentOperationsResponse {
  operations: any[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiUrl = 'http://localhost:8080/api/client/accounts';

  constructor(private readonly http: HttpClient) {}

  /**
   * Récupérer le solde du compte
   */
  getAccountBalance(): Observable<{ balance: number }> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError((error: any) => {
        console.error('Erreur AccountService.getAccountBalance:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer les informations du compte
   */
  getAccountInfo(): Observable<AccountInfo> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError((error: any) => {
        console.error('Erreur AccountService.getAccountInfo:', error);
        throw error;
      })
    );
  }
}

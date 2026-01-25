import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountInfo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiUrl = 'http://localhost:8080/api/client/accounts';

  constructor(private readonly http: HttpClient) {}

  getAccountBalance(): Observable<{ balance: number }> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError((error: any) => {
        console.error('Erreur AccountService.getAccountBalance:', error);
        throw error;
      })
    );
  }

  getAccountInfo(): Observable<AccountInfo> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError((error: any) => {
        console.error('Erreur AccountService.getAccountInfo:', error);
        throw error;
      })
    );
  }
}


import { Injectable , Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  fullName: string;
  role: string;
  accountNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {

    if(isPlatformBrowser(this.platformId)){

      this.loadUserFromStorage();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveUserToStorage(response);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  logout(): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  this.currentUserSubject.next(null);
}


 getToken(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem('token');
  }
  return null;
}


  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

 private saveUserToStorage(user: LoginResponse): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
}


 private loadUserFromStorage(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user: LoginResponse = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error parsing user from storage:', error);
    }
  }
}

}

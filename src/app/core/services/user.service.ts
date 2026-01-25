import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, UserListResponse, UpdateUserRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private readonly http: HttpClient) {}

  getUsers(pageNumber: number = 0, pageSize: number = 10, role?: string): Observable<UserListResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users: User[]) => {
        let filteredUsers = users;
        if (role) {
          filteredUsers = users.filter(u => u.role === role);
        }

        const start = pageNumber * pageSize;
        const paginatedUsers = filteredUsers.slice(start, start + pageSize);

        return {
          users: paginatedUsers,
          totalCount: filteredUsers.length,
          pageNumber: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }

  getUserById(userId: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateUser(userId: number | string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, data);
  }

  toggleUserStatus(userId: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  activateUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  deactivateUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  suspendUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  changeUserRole(userId: number | string, newRole: string, currentUser: User): Observable<User> {
    const fullName = currentUser.fullName || (currentUser as any).full_name || (currentUser as any).name || '';
    const email = currentUser.email || '';

    const request = {
      fullName: fullName,
      email: email,
      role: newRole
    };
    return this.http.put<User>(`${this.apiUrl}/${userId}`, request);
  }

  deleteUser(userId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  searchUsers(query: string, pageNumber: number = 0, pageSize: number = 10): Observable<UserListResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users: User[]) => {
        const searchLower = query.toLowerCase();
        const filteredUsers = users.filter(u =>
          u.fullName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.accountNumber?.toLowerCase().includes(searchLower)
        );

        const start = pageNumber * pageSize;
        const paginatedUsers = filteredUsers.slice(start, start + pageSize);

        return {
          users: paginatedUsers,
          totalCount: filteredUsers.length,
          pageNumber: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }
}


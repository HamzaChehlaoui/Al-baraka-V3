import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  accountNumber?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserListResponse {
  users: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private readonly http: HttpClient) {}

  /**
   * Récupérer la liste des utilisateurs (Admin)
   * Note: Backend returns List<UserDto> directly, we transform it to UserListResponse
   */
  getUsers(pageNumber: number = 0, pageSize: number = 10, role?: string): Observable<UserListResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users: User[]) => {
        // Filter by role if specified
        let filteredUsers = users;
        if (role) {
          filteredUsers = users.filter(u => u.role === role);
        }

        // Apply pagination on client side
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

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(userId: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(userId: number | string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, data);
  }

  /**
   * Toggle user status (ACTIVE/INACTIVE)
   */
  toggleUserStatus(userId: number | string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Activer un utilisateur (uses toggle-status)
   */
  activateUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  /**
   * Désactiver un utilisateur (uses toggle-status)
   */
  deactivateUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  /**
   * Suspendre un utilisateur (uses toggle-status)
   */
  suspendUser(userId: number | string): Observable<void> {
    return this.toggleUserStatus(userId);
  }

  /**
   * Changer le rôle d'un utilisateur
   * Note: Backend requires full UserRequest with validation, so we need to send all required fields
   */
  changeUserRole(userId: number | string, newRole: string, currentUser: User): Observable<User> {
    // Try different possible field names for fullName (backend may use different naming)
    const fullName = currentUser.fullName || (currentUser as any).full_name || (currentUser as any).name || '';
    const email = currentUser.email || '';

    const request = {
      fullName: fullName,
      email: email,
      role: newRole
    };
    return this.http.put<User>(`${this.apiUrl}/${userId}`, request);
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(userId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Rechercher des utilisateurs (client-side search since backend doesn't have search endpoint)
   */
  searchUsers(query: string, pageNumber: number = 0, pageSize: number = 10): Observable<UserListResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users: User[]) => {
        // Filter users by search query (search in fullName and email)
        const searchLower = query.toLowerCase();
        const filteredUsers = users.filter(u =>
          u.fullName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.accountNumber?.toLowerCase().includes(searchLower)
        );

        // Apply pagination
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

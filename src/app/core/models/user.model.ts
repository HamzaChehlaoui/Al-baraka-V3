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

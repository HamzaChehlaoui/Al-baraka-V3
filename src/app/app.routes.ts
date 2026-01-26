import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes - lazy loaded
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Client routes - lazy loaded
  {
    path: 'client',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
      },
      {
        path: 'deposit',
        loadComponent: () => import('./features/client/operations/deposit/deposit.component').then(m => m.DepositComponent)
      },
      {
        path: 'withdrawal',
        loadComponent: () => import('./features/client/operations/withdrawal/withdrawal.component').then(m => m.WithdrawalComponent)
      },
      {
        path: 'transfer',
        loadComponent: () => import('./features/client/operations/transfer/transfer.component').then(m => m.TransferComponent)
      },
      {
        path: 'operations',
        loadComponent: () => import('./features/client/operations/operations-history/operations-history.component').then(m => m.OperationsHistoryComponent)
      }
    ]
  },

  // Agent routes - lazy loaded
  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['AGENT'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent)
      },
      {
        path: 'pending-operations',
        loadComponent: () => import('./features/agent/pending-operations/pending-operations.component').then(m => m.PendingOperationsComponent)
      }
    ]
  },

  // Admin routes - lazy loaded
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];

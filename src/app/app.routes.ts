// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ClientDashboardComponent } from './features/client/client-dashboard/client-dashboard.component';
import { DepositComponent } from './features/client/operations/deposit/deposit.component';
import { WithdrawalComponent } from './features/client/operations/withdrawal/withdrawal.component';
import { TransferComponent } from './features/client/operations/transfer/transfer.component';
import { OperationsHistoryComponent } from './features/client/operations/operations-history/operations-history.component';
import { AgentDashboardComponent } from './features/agent/agent-dashboard/agent-dashboard.component';
import { PendingOperationsComponent } from './features/agent/pending-operations/pending-operations.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'client',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      { path: '', component: ClientDashboardComponent },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'deposit', component: DepositComponent },
      { path: 'withdrawal', component: WithdrawalComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'operations', component: OperationsHistoryComponent }
    ]
  },

  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['AGENT'] },
    children: [
      { path: '', component: AgentDashboardComponent },
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'pending-operations', component: PendingOperationsComponent }
    ]
  },

  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      // Admin routes will be added here
    ]
  },

  { path: '**', redirectTo: '/login' }
];

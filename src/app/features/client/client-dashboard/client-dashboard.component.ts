import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AccountService } from '../../../core/services/account.service';
import { OperationService } from '../../../core/services/operation.service';
import { combineLatest } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [AccountService, OperationService],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  currentUser: any = null;
  accountBalance: number = 0;
  recentOperations: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly operationService: OperationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Initialiser les données du dashboard
    this.loadAccountData();
  }

  loadAccountData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Combiner les deux requêtes pour mieux gérer les erreurs
    combineLatest([
      this.accountService.getAccountBalance().pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement du solde:', error);
          return of(null);
        })
      ),
      this.operationService.getOperationHistory(0, 5).pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement des opérations:', error);
          return of(null);
        })
      )
    ]).subscribe({
      next: ([balanceData, operationsData]: any) => {
        this.isLoading = false;
        console.log('✅ Données reçues - Balance:', balanceData);
        console.log('✅ Données reçues - Operations:', operationsData);

        // Vérifier les erreurs individuelles
        const errors: string[] = [];

        if (!balanceData) {
          errors.push('Impossible de charger le solde du compte');
        } else {
          // balanceData peut être un array ou un objet
          const account = Array.isArray(balanceData) ? balanceData[0] : balanceData;
          if (account && account.balance) {
            this.accountBalance = account.balance;
            console.log('💰 Solde défini à:', this.accountBalance);
          } else {
            errors.push('Impossible de charger le solde du compte');
          }
        }

        if (!operationsData) {
          errors.push('Impossible de charger l\'historique des opérations');
        } else {
          // operationsData vient de OperationService.getOperationHistory()
          if (operationsData.operations && Array.isArray(operationsData.operations)) {
            this.recentOperations = operationsData.operations;
          } else if (Array.isArray(operationsData)) {
            this.recentOperations = operationsData;
          } else {
            this.recentOperations = [];
          }
          console.log('📋 Opérations définies à:', this.recentOperations);
        }

        if (errors.length > 0) {
          this.errorMessage = errors.join('; ');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Erreur générale:', error);
        this.errorMessage = 'Une erreur est survenue lors du chargement des données';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }}

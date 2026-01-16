import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';

@Component({
  selector: 'app-withdrawal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './withdrawal.component.html',
  styleUrl: './withdrawal.component.css'
})
export class WithdrawalComponent {
  withdrawalForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private router: Router
  ) {
    this.withdrawalForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.maxLength(500)]],
      withdrawalMethod: ['ATM', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.withdrawalForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { amount, description } = this.withdrawalForm.value;

    this.operationService.createWithdrawal(amount, 'DH', description).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Retrait créé avec succès! ID: ${response.id}`;
        this.withdrawalForm.reset();

        setTimeout(() => {
          this.router.navigate(['/client']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du retrait';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }
}

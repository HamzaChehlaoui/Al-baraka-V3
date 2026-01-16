import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.css'
})
export class DepositComponent {
  depositForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private router: Router
  ) {
    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.maxLength(500)]],
      paymentMethod: ['CARD', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.depositForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { amount, description } = this.depositForm.value;

    this.operationService.createDeposit(amount, 'DH', description).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Dépôt créé avec succès! ID: ${response.id}`;
        this.depositForm.reset();

        setTimeout(() => {
          this.router.navigate(['/client']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du dépôt';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }
}

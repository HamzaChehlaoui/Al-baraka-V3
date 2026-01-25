import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-withdrawal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  templateUrl: './withdrawal.component.html',
  styleUrl: './withdrawal.component.css'
})
export class WithdrawalComponent {
  withdrawalForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  requiresJustification: boolean = false;
  justificationFile: File | null = null;

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

    this.withdrawalForm.get('amount')?.valueChanges.subscribe((value) => {
      this.requiresJustification = value > 10000;
    });
  }

  onFileSelected(file: File): void {
    this.justificationFile = file;
  }

  onFileRemoved(): void {
    this.justificationFile = null;
  }

  onSubmit(): void {
    if (this.withdrawalForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    if (this.requiresJustification && !this.justificationFile) {
      this.errorMessage = 'Un justificatif est requis pour les montants supérieurs à 10 000 DH';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { amount, description } = this.withdrawalForm.value;

    this.operationService.createWithdrawal(amount, 'DH', description).subscribe({
      next: (response) => {
        if (this.requiresJustification && this.justificationFile) {
          this.uploadJustification(response.id);
        } else {
          this.handleSuccess(response.id);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du retrait';
      }
    });
  }

  private uploadJustification(operationId: string): void {
    if (!this.justificationFile) return;

    this.operationService.uploadJustification(operationId, this.justificationFile).subscribe({
      next: () => {
        this.handleSuccess(operationId, true);
      },
      error: (error) => {
        this.isLoading = false;
        this.successMessage = `Retrait créé (ID: ${operationId}) mais erreur lors de l'upload du justificatif`;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'upload du justificatif';
      }
    });
  }

  private handleSuccess(operationId: string, withJustification: boolean = false): void {
    this.isLoading = false;
    this.successMessage = `Retrait créé avec succès! ID: ${operationId}`;
    if (withJustification) {
      this.successMessage += ' - Justificatif téléchargé';
    }

    this.withdrawalForm.reset();
    this.justificationFile = null;

    setTimeout(() => {
      this.router.navigate(['/client']);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }
}

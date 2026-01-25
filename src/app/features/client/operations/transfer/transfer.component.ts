import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent {
  transferForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  requiresJustification: boolean = false;
  justificationFile: File | null = null;
  isUploadingFile: boolean = false;

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private router: Router
  ) {
    this.transferForm = this.fb.group({
      recipientAccountNumber: ['', [Validators.required]],
      recipientName: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.maxLength(500)]]
    });

    // Surveiller les changements du montant
    this.transferForm.get('amount')?.valueChanges.subscribe((value) => {
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
    if (this.transferForm.invalid) {
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

    const { recipientAccountNumber, amount, description } = this.transferForm.value;

    this.operationService.createTransfer(recipientAccountNumber, amount, 'DH', description).subscribe({
      next: (response) => {
        // Si un justificatif est requis, l'uploader
        if (this.requiresJustification && this.justificationFile) {
          this.uploadJustification(response.id);
        } else {
          this.handleSuccess(response.id);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du virement';
      }
    });
  }

  private uploadJustification(operationId: string): void {
    if (!this.justificationFile) return;

    this.isUploadingFile = true;
    this.operationService.uploadJustification(operationId, this.justificationFile).subscribe({
      next: () => {
        this.isUploadingFile = false;
        this.handleSuccess(operationId, true);
      },
      error: (error) => {
        this.isUploadingFile = false;
        this.isLoading = false;
        this.successMessage = `Virement créé (ID: ${operationId}) mais erreur lors de l'upload du justificatif`;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'upload du justificatif';
      }
    });
  }

  private handleSuccess(operationId: string, withJustification: boolean = false): void {
    this.isLoading = false;
    this.successMessage = `Virement créé avec succès! ID: ${operationId}`;
    if (withJustification) {
      this.successMessage += ' - Justificatif téléchargé';
    }

    this.transferForm.reset();
    this.justificationFile = null;

    setTimeout(() => {
      this.router.navigate(['/client']);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }
}

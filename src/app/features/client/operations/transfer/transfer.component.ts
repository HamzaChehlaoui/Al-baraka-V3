import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent {
  transferForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  requiresJustification: boolean = false;

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

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { recipientAccountNumber, amount, description } = this.transferForm.value;

    this.operationService.createTransfer(recipientAccountNumber, amount, 'DH', description).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Virement créé avec succès! ID: ${response.id}`;

        if (this.requiresJustification) {
          this.successMessage += ' - Veuillez télécharger un justificatif';
        }

        this.transferForm.reset();

        setTimeout(() => {
          this.router.navigate(['/client']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du virement';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client']);
  }
}

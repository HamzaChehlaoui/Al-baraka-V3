import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="onCancel()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="isLoading"
          >
            {{ cancelText }}
          </button>
          <button
            class="btn"
            [ngClass]="'btn-' + confirmType"
            (click)="onConfirm()"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="spinner-small"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: #1a1a2e;
      border-radius: 16px;
      width: 90%;
      max-width: 400px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header h3 {
      margin: 0;
      color: #fff;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-primary {
      background: #667eea;
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a6fd6;
    }

    .btn-danger {
      background: #ef4444;
      color: #fff;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-success {
      background: #22c55e;
      color: #fff;
    }

    .btn-success:hover:not(:disabled) {
      background: #16a34a;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr?';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';
  @Input() confirmType: 'primary' | 'danger' | 'success' = 'primary';
  @Input() isLoading: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

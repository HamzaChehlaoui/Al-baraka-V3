import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert" [ngClass]="'alert-' + type" *ngIf="show">
      <span class="alert-icon">{{ getIcon() }}</span>
      <span class="alert-message">{{ message }}</span>
      <button *ngIf="dismissible" class="alert-close" (click)="dismiss()">×</button>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      gap: 0.75rem;
    }

    .alert-success {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .alert-warning {
      background: rgba(234, 179, 8, 0.2);
      border: 1px solid rgba(234, 179, 8, 0.3);
      color: #facc15;
    }

    .alert-info {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
    }

    .alert-icon {
      font-size: 1.2rem;
    }

    .alert-message {
      flex: 1;
    }

    .alert-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .alert-close:hover {
      opacity: 1;
    }
  `]
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() show: boolean = true;
  @Output() dismissed = new EventEmitter<void>();

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[this.type];
  }

  dismiss(): void {
    this.show = false;
    this.dismissed.emit();
  }
}

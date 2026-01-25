import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [ngClass]="{'overlay': overlay}">
      <div class="spinner" [ngClass]="size"></div>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner.small {
      width: 24px;
      height: 24px;
    }

    .spinner.medium {
      width: 40px;
      height: 40px;
    }

    .spinner.large {
      width: 60px;
      height: 60px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-message {
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-icon">🏦</span>
          <span class="brand-name">Al Baraka Digital</span>
        </div>
        <div class="footer-info">
          <p>&copy; {{ currentYear }} Al Baraka Bank. Tous droits réservés.</p>
        </div>
        <div class="footer-links">
          <a href="#">Conditions d'utilisation</a>
          <a href="#">Politique de confidentialité</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .main-footer {
      background: rgba(26, 26, 46, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem 2rem;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 1.25rem;
    }

    .brand-name {
      font-weight: 600;
      color: #fff;
    }

    .footer-info p {
      margin: 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    .footer-links {
      display: flex;
      gap: 1.5rem;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: #fff;
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
      }

      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}

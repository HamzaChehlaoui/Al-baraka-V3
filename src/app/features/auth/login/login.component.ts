import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    console.log('Sending login request:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        // Rediriger vers la page appropriée selon le rôle
        this.redirectByRole(response.role);
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Adresse e-mail ou mot de passe incorrect';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Assurez-vous que API Spring Boot est activée';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur s est produite lors de la connexion.';
        }
      }
    });
  }

  /**
   * Rediriger l'utilisateur vers la page appropriée selon son rôle
   * @param role Le rôle de l'utilisateur (CLIENT, AGENT, ADMIN)
   */
  private redirectByRole(role: string): void {
    switch (role) {
      case 'CLIENT':
        this.router.navigate(['/client']);
        break;
      case 'AGENT':
        this.router.navigate(['/agent']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        // Fallback vers dashboard
        console.warn(`Rôle inconnu: ${role}`);
        this.router.navigate(['/dashboard']);
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}

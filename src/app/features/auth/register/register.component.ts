import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: RegisterRequest = {
      fullName: this.registerForm.get('fullName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };

    console.log('Sending register request:', credentials);

    this.authService.register(credentials).subscribe({
      next: (response: any) => {
        console.log('Register successful:', response);
        this.isLoading = false;

        // Rediriger vers la page appropriée selon le rôle
        this.redirectByRole(response.role);
      },
      error: (error: any) => {
        console.error('Register error:', error);
        this.isLoading = false;

        if (error.status === 400) {
          this.errorMessage = 'Cet e-mail existe déjà. Veuillez utiliser une autre adresse.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Assurez-vous que API Spring Boot est activée';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur s est produite lors de l inscription.';
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

  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}

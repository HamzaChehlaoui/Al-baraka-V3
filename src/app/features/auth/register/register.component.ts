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
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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
      next: (response) => {
        console.log('Register successful:', response);
        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
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

  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!password || !confirmPassword) {
    return null;
  }
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected hidePassword = true;
  protected hideConfirmPassword = true;
  protected isSubmitting = false;
  protected submitError = '';
  protected successMessage = '';
  protected readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.formBuilder.nonNullable.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

  protected submit(): void {
    this.submitError = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .register({
        username: this.toUsername(name),
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Account created successfully. Redirecting to login...';
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 1200);
        },
        error: (error: HttpErrorResponse) => {
          this.submitError = this.getFriendlyError(error);
        },
      });
  }

  protected get name() {
    return this.form.controls.name;
  }

  protected get email() {
    return this.form.controls.email;
  }

  protected get password() {
    return this.form.controls.password;
  }

  protected get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  protected get hasPasswordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.confirmPassword.touched;
  }

  private toUsername(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 30);
  }

  private getFriendlyError(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return 'Could not create account. Email or username may already be in use.';
    }
    return 'Registration failed. Please try again in a moment.';
  }

}


import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  formMessage = '';
  formError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  signupForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    agreeToTerms: [false, Validators.requiredTrue]
  });

  get passwordStrength(): string {
    const password = this.signupForm.get('password')?.value || '';
    if (password.length < 8) return 'Weak';
    if (password.length < 12) return 'Medium';
    return 'Strong';
  }

  get passwordsMatch(): boolean {
    const password = this.signupForm.get('password')?.value || '';
    const confirmPassword = this.signupForm.get('confirmPassword')?.value || '';
    return password !== '' && password === confirmPassword;
  }

  get canSubmit(): boolean {
    return this.signupForm.valid && this.passwordsMatch;
  }

  async submit() {
    this.formMessage = '';
    this.formError = '';

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      this.formError = 'Passwords do not match.';
      return;
    }

    const result = await this.authService.register({
      fullName: this.signupForm.value.fullName || '',
      email: this.signupForm.value.email || '',
      phone: this.signupForm.value.phone || '',
      password: this.signupForm.value.password || ''
    });

    if (!result.success) {
      this.formError = result.message;
      return;
    }

    this.formMessage = result.message;
    await this.cartService.connectCustomerCart();
    this.signupForm.reset();

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 900);
  }
}

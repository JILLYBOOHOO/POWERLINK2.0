import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  feedbackMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async submit(): Promise<void> {
    this.feedbackMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const result = await this.authService.login(
      this.loginForm.value.email || '',
      this.loginForm.value.password || ''
    );

    if (!result.success) {
      this.errorMessage = result.message;
      return;
    }

    this.feedbackMessage = result.message;
    await this.cartService.connectCustomerCart();
    this.loginForm.reset();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/account';
    this.router.navigateByUrl(returnUrl);
  }
}

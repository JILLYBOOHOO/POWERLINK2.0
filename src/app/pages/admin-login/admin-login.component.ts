import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  adminForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async submit(): Promise<void> {
    this.errorMessage = '';

    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const result = await this.authService.adminLogin(
      this.adminForm.value.email || '',
      this.adminForm.value.password || ''
    );

    if (!result.success) {
      this.errorMessage = result.message;
      return;
    }

    this.router.navigate(['/admin/orders']);
  }
}

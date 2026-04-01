import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-plumber-register',
  templateUrl: './plumber-register.component.html',
  styleUrls: ['./plumber-register.component.css']
})
export class PlumberRegisterComponent {
  private readonly defaultImage = 'assets/plumber-andre.svg';

  plumberForm: FormGroup;
  formMessage = '';

  constructor(
    private fb: FormBuilder,
    private adminDashboardService: AdminDashboardService
  ) {
    this.plumberForm = this.fb.group({
      name: ['', Validators.required],
      specialty: ['', Validators.required],
      location: ['', Validators.required],
      experience: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async submit(): Promise<void> {
    this.formMessage = '';

    if (this.plumberForm.invalid) {
      this.plumberForm.markAllAsTouched();
      return;
    }

    const submitted = await this.adminDashboardService.addRegistration({
      name: this.plumberForm.value.name,
      specialty: this.plumberForm.value.specialty,
      location: this.plumberForm.value.location,
      experience: Number(this.plumberForm.value.experience)
    });

    if (!submitted) {
      this.formMessage = 'Registration could not be submitted. Check that the backend is running.';
      return;
    }

    this.formMessage = 'Registration submitted. Our team will review your profile shortly.';
    this.plumberForm.reset({
      image: this.defaultImage
    });
  }
}

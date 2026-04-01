
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendApiService } from '../../services/backend-api.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  feedbackMessage = '';
  errorMessage = '';
  readonly supportPhone = '+1-876-555-7693';
  readonly supportEmail = 'support@powerlink.com';
  readonly officeAddress = '14 Harbour Street, Kingston, Jamaica';
  readonly mapsUrl = 'https://www.google.com/maps/search/?api=1&query=14+Harbour+Street+Kingston+Jamaica';
  readonly emergencyUrl = 'tel:+18765557693';
  readonly emailUrl = 'mailto:support@powerlink.com';

  constructor(
    private fb: FormBuilder,
    private backendApi: BackendApiService
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      service: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  async submitForm(): Promise<void> {
    this.feedbackMessage = '';
    this.errorMessage = '';

    if (this.contactForm.valid) {
      const response = await this.backendApi.post<{ message: string }>('/contact', this.contactForm.value);

      if (!response.ok) {
        this.errorMessage = response.message || 'Message could not be sent.';
        return;
      }

      this.feedbackMessage = response.message || 'Message sent successfully.';
      this.contactForm.reset();
    }
  }
}

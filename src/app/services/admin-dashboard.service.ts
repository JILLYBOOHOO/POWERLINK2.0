import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BackendApiService } from './backend-api.service';

export interface AdminOrder {
  reference: string;
  customer: string;
  item: string;
  type: 'Plumber Booking' | 'Supply Order';
  total: number;
  status: 'Confirmed' | 'Preparing' | 'Scheduled' | 'Out for Delivery';
  fulfillment: string;
  submittedAt: string;
}

export interface AdminRegistration {
  name: string;
  specialty: string;
  location: string;
  experience: number;
  submittedAt: string;
  status: 'Pending Verification' | 'Background Check' | 'Approved';
}

export interface CreateAdminOrder {
  reference: string;
  customer: string;
  item: string;
  type: 'Plumber Booking' | 'Supply Order';
  total: number;
  fulfillment: string;
}

export interface CreateAdminRegistration {
  name: string;
  specialty: string;
  location: string;
  experience: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  readonly orders: AdminOrder[] = [];
  readonly registrations: AdminRegistration[] = [];

  constructor(
    private authService: AuthService,
    private backendApi: BackendApiService
  ) {}

  async loadOrders(): Promise<void> {
    console.log('Loading orders with token:', this.authService.getAdminToken() ? 'PRESENT' : 'MISSING');
    const response = await this.backendApi.get<{ orders: AdminOrder[] }>('/orders', this.authService.getAdminToken());

    if (!response.ok || !response.data) {
      console.warn('Order load failed:', response.message);
      this.orders.splice(0, this.orders.length);
      return;
    }

    console.log('Orders loaded:', response.data.orders?.length);
    this.orders.splice(0, this.orders.length, ...(response.data.orders || []));
  }

  async loadRegistrations(): Promise<void> {
    console.log('Loading registrations with token:', this.authService.getAdminToken() ? 'PRESENT' : 'MISSING');
    const response = await this.backendApi.get<{ registrations: AdminRegistration[] }>('/registrations', this.authService.getAdminToken());

    if (!response.ok || !response.data) {
      console.warn('Registration load failed:', response.message);
      this.registrations.splice(0, this.registrations.length);
      return;
    }

    console.log('Registrations loaded:', response.data.registrations?.length);
    this.registrations.splice(0, this.registrations.length, ...(response.data.registrations || []));
  }

  async addOrder(order: CreateAdminOrder): Promise<boolean> {
    const response = await this.backendApi.post('/orders', order, this.authService.getCustomerToken());
    return response.ok;
  }

  async addRegistration(registration: CreateAdminRegistration): Promise<boolean> {
    const response = await this.backendApi.post('/registrations', registration);
    return response.ok;
  }

  async updateRegistrationStatus(registration: AdminRegistration, status: string): Promise<boolean> {
    const response = await this.backendApi.put('/registrations/status', { name: registration.name, specialty: registration.specialty, status }, this.authService.getAdminToken());
    if (response.ok) {
      await this.loadRegistrations();
    }
    return response.ok;
  }
}

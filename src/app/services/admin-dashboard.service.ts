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
    const response = await this.backendApi.get<{ orders: AdminOrder[] }>('/orders', this.authService.getAdminToken());

    if (!response.ok || !response.data) {
      this.orders.splice(0, this.orders.length);
      return;
    }

    this.orders.splice(0, this.orders.length, ...(response.data.orders || []));
  }

  async loadRegistrations(): Promise<void> {
    const response = await this.backendApi.get<{ registrations: AdminRegistration[] }>('/registrations', this.authService.getAdminToken());

    if (!response.ok || !response.data) {
      this.registrations.splice(0, this.registrations.length);
      return;
    }

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
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BackendApiService } from '../../services/backend-api.service';

interface AccountOrder {
  reference: string;
  customer: string;
  item: string;
  type: string;
  total: number;
  status: string;
  fulfillment: string;
  submittedAt: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  orders: AccountOrder[] = [];
  loading = true;
  errorMessage = '';
  backendStatus = 'Checking backend connection...';

  constructor(
    public authService: AuthService,
    private backendApi: BackendApiService
  ) {}

  get customerName(): string {
    return this.authService.getCurrentUser()?.fullName || 'Customer';
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.errorMessage = 'Please log in to view your account orders.';
      return;
    }

    const response = await this.backendApi.get<{ orders: AccountOrder[] }>(
      '/account/orders',
      this.authService.getCustomerToken()
    );

    if (!response.ok || !response.data) {
      this.errorMessage = response.message || 'Unable to load your orders.';
      this.backendStatus = 'Backend unavailable for account history.';
      this.loading = false;
      return;
    }

    this.orders = response.data.orders || [];
    this.backendStatus = 'Account connected to backend order history.';
    this.loading = false;
  }
}

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BackendApiService } from './backend-api.service';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'powerlink_plumbing_cart';
  private items: CartItem[] = this.loadItems();
  syncState: 'idle' | 'syncing' | 'synced' | 'offline' = 'idle';
  syncMessage = '';

  constructor(
    private authService: AuthService,
    private backendApi: BackendApiService
  ) {
    if (this.authService.isLoggedIn()) {
      void this.connectCustomerCart();
    }
  }

  get cartItems(): CartItem[] {
    return this.items;
  }

  get totalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const normalizedQuantity = quantity > 0 ? quantity : 1;
    const existingItem = this.items.find((entry) => entry.name === item.name);

    if (existingItem) {
      existingItem.quantity += normalizedQuantity;
      this.persistLocal();
      void this.syncRemoteCart();
      return;
    }

    this.items = [...this.items, { ...item, quantity: normalizedQuantity }];
    this.persistLocal();
    void this.syncRemoteCart();
  }

  updateQuantity(name: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(name);
      return;
    }

    this.items = this.items.map((item) =>
      item.name === name ? { ...item, quantity } : item
    );
    this.persistLocal();
    void this.syncRemoteCart();
  }

  removeItem(name: string): void {
    this.items = this.items.filter((item) => item.name !== name);
    this.persistLocal();
    void this.syncRemoteCart();
  }

  clear(): void {
    this.items = [];
    this.persistLocal();
    void this.syncRemoteCart();
  }

  resetSession(): void {
    this.items = [];
    this.syncState = 'idle';
    this.syncMessage = 'Sign in to sync your cart across devices.';
    this.persistLocal();
  }

  async connectCustomerCart(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.syncState = 'idle';
      this.syncMessage = 'Sign in to sync your cart across devices.';
      return;
    }

    this.syncState = 'syncing';
    this.syncMessage = 'Syncing your cart with the account.';

    const response = await this.backendApi.get<{ items: CartItem[] }>('/cart', this.authService.getCustomerToken());

    if (!response.ok || !response.data) {
      this.persistLocal();
      this.syncState = 'offline';
      this.syncMessage = response.status === 0
        ? 'Backend unavailable. Using saved browser cart.'
        : 'Cart sync is unavailable right now.';
      return;
    }

    const remoteItems = Array.isArray(response.data.items) ? response.data.items as CartItem[] : [];

    if (remoteItems.length === 0 && this.items.length > 0) {
      await this.syncRemoteCart();
      return;
    }

    if (remoteItems.length > 0 && this.items.length > 0) {
      this.items = this.mergeItems(remoteItems, this.items);
      this.persistLocal();
      await this.syncRemoteCart();
      return;
    }

    this.items = remoteItems;
    this.persistLocal();
    this.syncState = 'synced';
    this.syncMessage = 'Cart synced with your account.';
  }

  private mergeItems(primary: CartItem[], secondary: CartItem[]): CartItem[] {
    const merged = [...primary];

    secondary.forEach((item) => {
      const existing = merged.find((entry) => entry.name === item.name);

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push({ ...item });
      }
    });

    return merged;
  }

  private loadItems(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistLocal(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  private async syncRemoteCart(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.syncState = 'idle';
      return;
    }

    this.syncState = 'syncing';
    this.syncMessage = 'Saving cart changes...';

    const response = await this.backendApi.put('/cart', { items: this.items }, this.authService.getCustomerToken());

    if (!response.ok) {
      this.persistLocal();
      this.syncState = 'offline';
      this.syncMessage = response.status === 0
        ? 'Cart changes saved locally. Backend is unreachable.'
        : 'Cart changes saved locally only.';
      return;
    }

    this.syncState = 'synced';
    this.syncMessage = 'Cart synced with your account.';
  }
}

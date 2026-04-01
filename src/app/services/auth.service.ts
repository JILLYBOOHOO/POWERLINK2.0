import { Injectable } from '@angular/core';
import { BackendApiService } from './backend-api.service';

export interface AppUser {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserKey = 'powerlink-current-user';
  private readonly adminUserKey = 'powerlink-admin-session';

  constructor(private backendApi: BackendApiService) {}

  async register(user: AppUser): Promise<{ success: boolean; message: string }> {
    const response = await this.backendApi.post<AuthResponse>('/auth/register', user);
    const authData = response.data;

    if (!response.ok || !authData) {
      return {
        success: false,
        message: response.message || 'Unable to create account.'
      };
    }

    if (authData.user && authData.token) {
      this.setCurrentUser({
        fullName: authData.user.fullName,
        email: authData.user.email,
        phone: authData.user.phone,
        password: ''
      }, authData.token);
    }

    return {
      success: true,
      message: authData.message || 'Account created successfully.'
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await this.backendApi.post<AuthResponse>('/auth/login', { email, password });
    const authData = response.data;

    if (!response.ok || !authData) {
      return {
        success: false,
        message: response.message || 'Invalid email or password.'
      };
    }

    if (authData.user && authData.token) {
      this.setCurrentUser({
        fullName: authData.user.fullName,
        email: authData.user.email,
        phone: authData.user.phone,
        password: ''
      }, authData.token);
    }

    return {
      success: true,
      message: authData.message || 'Login successful.'
    };
  }

  async adminLogin(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await this.backendApi.post<{ message: string; token: string }>('/admin/login', { email, password });
    const authData = response.data;

    if (!response.ok || !authData) {
      return {
        success: false,
        message: response.message || 'Invalid admin credentials.'
      };
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.adminUserKey, JSON.stringify({ token: authData.token, email }));
    }

    return {
      success: true,
      message: authData.message || 'Admin login successful.'
    };
  }

  logout(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem(this.adminUserKey);
  }

  getCurrentUser(): AppUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.currentUserKey);

    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as AppUser & { token?: string };
      return {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        password: ''
      };
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(this.adminUserKey) !== null;
  }

  getCustomerToken(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    const stored = localStorage.getItem(this.currentUserKey);

    if (!stored) {
      return '';
    }

    try {
      const parsed = JSON.parse(stored) as { token?: string };
      return parsed.token || '';
    } catch {
      return '';
    }
  }

  getAdminToken(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    const stored = localStorage.getItem(this.adminUserKey);

    if (!stored) {
      return '';
    }

    try {
      const parsed = JSON.parse(stored) as { token?: string };
      return parsed.token || '';
    } catch {
      return '';
    }
  }

  setCurrentUser(user: AppUser, token: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.currentUserKey, JSON.stringify({ ...user, token }));
  }
}

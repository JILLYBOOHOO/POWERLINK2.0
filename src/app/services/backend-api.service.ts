import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private readonly apiBase = environment.apiBaseUrl;

  get<T>(path: string, token = ''): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      headers: this.buildHeaders(token)
    });
  }

  post<T>(path: string, body: unknown, token = ''): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      headers: this.buildHeaders(token),
      body: JSON.stringify(body)
    });
  }

  put<T>(path: string, body: unknown, token = ''): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      headers: this.buildHeaders(token),
      body: JSON.stringify(body)
    });
  }

  private buildHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.apiBase}${path}`, init);
      const data = await this.parseJson<T>(response);
      return {
        ok: response.ok,
        status: response.status,
        data,
        message: this.extractMessage(data, response.ok)
      };
    } catch {
      return {
        ok: false,
        status: 0,
        data: null,
        message: 'Backend connection failed. Make sure the API server is running.'
      };
    }
  }

  private async parseJson<T>(response: Response): Promise<T | null> {
    try {
      return await response.json() as T;
    } catch {
      return null;
    }
  }

  private extractMessage<T>(data: T | null, isSuccess: boolean): string {
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return isSuccess ? 'Request completed successfully.' : 'Request failed.';
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/token/`, { username, password })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/users/`, payload);
  }

  refreshToken(): Observable<string> {
    const refresh = this.getRefreshToken();
    return this.http
      .post<{ access: string }>(`${environment.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap((response) => localStorage.setItem(this.accessTokenKey, response.access)),
        map((response) => response.access),
      );
  }

  logout(): void {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUsername(): string {
    const token = this.getAccessToken();
    if (!token) {
      return 'User';
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as { username?: string; email?: string; user_id?: string };

      // Prioritize returning the username
      if (payload.username) {
        return payload.username;
      }

      // Fallback to email if username is not available
      if (payload.email) {
        return payload.email.split('@')[0]; // Extract the part before '@' as a username-like fallback
      }

      // Fallback to user_id if neither username nor email is available
      return payload.user_id || 'User';
    } catch {
      return 'User';
    }
  }

  getCurrentUserEmail(): string {
    const token = this.getAccessToken();
    if (!token) {
      return 'user@taskmanager.local';
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as {
        email?: string;
        username?: string;
      };
      if (payload.email) {
        return payload.email;
      }
      if (payload.username) {
        return payload.username;
      }
      return 'user@taskmanager.local';
    } catch {
      return 'user@taskmanager.local';
    }
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(this.accessTokenKey, tokens.access);
    localStorage.setItem(this.refreshTokenKey, tokens.refresh);
  }
}

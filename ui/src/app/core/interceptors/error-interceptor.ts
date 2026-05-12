import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const isApiRequest = req.url.startsWith(environment.apiUrl);
      const isTokenEndpoint = req.url.includes('/token/');

      if (!isApiRequest) {
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          if (!isTokenEndpoint) {
            authService.logout();
            router.navigateByUrl('/auth/login');
            snackBar.open('Your session expired. Please log in again.', 'Dismiss', {
              duration: 3500,
            });
          }
          break;
        case 403:
          snackBar.open("You don't have permission", 'Dismiss', { duration: 3500 });
          break;
        case 404:
          snackBar.open('Resource not found', 'Dismiss', { duration: 3500 });
          break;
        case 500:
          snackBar.open('Server error, try again later', 'Dismiss', { duration: 4000 });
          break;
        default:
          break;
      }

      return throwError(() => error);
    }),
  );
};

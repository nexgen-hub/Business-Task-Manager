import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, shareReplay, startWith, take } from 'rxjs';

import { AuthService } from './core/services/auth';
import { LoadingService } from './core/services/loading';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly isLoading$;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Tasks', path: '/tasks' },
  ];
  protected readonly isHandset$;
  protected readonly currentRoute$;

  constructor(
    private readonly loadingService: LoadingService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    this.loadingService.show();
    this.isLoading$ = this.loadingService.isLoading$;
    this.isHandset$ = this.breakpointObserver.observe('(max-width: 900px)').pipe(
      map((state) => state.matches),
      shareReplay(1),
    );
    this.currentRoute$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
      shareReplay(1),
    );

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => this.loadingService.hide());
  }

  protected get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  protected get currentUserEmail(): string {
    return this.authService.getCurrentUserEmail();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
    this.snackBar.open('Logged out successfully', 'Dismiss', { duration: 2500 });
  }

  protected isActiveRoute(currentRoute: string | null, link: string): boolean {
    if (!currentRoute) {
      return false;
    }
    return currentRoute.startsWith(link);
  }
}

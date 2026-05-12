import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, distinctUntilChanged, observeOn } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = 0;
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.isLoadingSubject
    .asObservable()
    .pipe(observeOn(asyncScheduler), distinctUntilChanged());

  show(): void {
    this.activeRequests += 1;
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.activeRequests = Math.max(this.activeRequests - 1, 0);
    this.isLoadingSubject.next(this.activeRequests > 0);
  }
}

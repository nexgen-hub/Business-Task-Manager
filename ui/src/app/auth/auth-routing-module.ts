import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { redirectIfAuthenticatedGuard } from '../core/guards/redirect-if-authenticated-guard';
import { Login } from './login/login';
import { Register } from './register/register';

const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [redirectIfAuthenticatedGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [redirectIfAuthenticatedGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { DashboardComponent } from './main/main';
import { SharedModule } from '../shared/shared-module';


@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    BaseChartDirective,
    SharedModule,
    DashboardRoutingModule,
  ]
})
export class DashboardModule { }

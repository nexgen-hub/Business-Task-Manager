import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TasksRoutingModule } from './tasks-routing-module';
import { TaskListComponent } from './list/list';
import { SharedModule } from '../shared/shared-module';
import { TaskFormDialogComponent } from './task-form-dialog/task-form-dialog';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog';


@NgModule({
  declarations: [
    TaskListComponent,
    TaskFormDialogComponent,
    DeleteConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TasksRoutingModule,
  ]
})
export class TasksModule { }

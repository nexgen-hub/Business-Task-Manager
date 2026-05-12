import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Task, TaskPayload, TaskService } from '../../core/services/task';

export interface TaskFormDialogData {
  mode: 'create' | 'edit';
  task?: Task;
}

@Component({
  selector: 'app-task-form-dialog',
  standalone: false,
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialogComponent {
  protected isSubmitting = false;
  protected submitError = '';

  protected readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly taskService: TaskService,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected readonly data: TaskFormDialogData,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      title: [data.task?.title ?? '', [Validators.required, Validators.maxLength(200)]],
      description: [data.task?.description ?? ''],
      status: [data.task?.status ?? 'PENDING'],
      priority: [data.task?.priority ?? 'MEDIUM'],
      due_date: [data.task?.due_date ? new Date(data.task.due_date) : null],
    });
  }

  protected submit(): void {
    this.submitError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.taskService.createTask(payload)
        : this.taskService.updateTask(this.data.task!.id, payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.snackBar.open(
          this.data.mode === 'create' ? 'Task created successfully' : 'Task updated',
          'Dismiss',
          { duration: 2000 },
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitError = 'Could not save task. Please try again.';
      },
    });
  }

  protected close(): void {
    this.dialogRef.close(false);
  }

  protected get submitButtonText(): string {
    return this.data.mode === 'create' ? 'Create Task' : 'Update Task';
  }

  protected get titleText(): string {
    return this.data.mode === 'create' ? 'Add Task' : 'Edit Task';
  }

  protected get titleControl() {
    return this.form.controls.title;
  }

  private toPayload(): TaskPayload {
    const value = this.form.getRawValue();
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      priority: value.priority,
      due_date: value.due_date ? new Date(value.due_date).toISOString() : null,
    };
  }

}

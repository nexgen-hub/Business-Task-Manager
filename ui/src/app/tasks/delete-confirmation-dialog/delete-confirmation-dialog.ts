import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DeleteConfirmationData {
  title: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: false,
  templateUrl: './delete-confirmation-dialog.html',
  styleUrl: './delete-confirmation-dialog.scss',
})
export class DeleteConfirmationDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected readonly data: DeleteConfirmationData,
  ) {}

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}

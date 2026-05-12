import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import {
  Task,
  TaskFilters,
  TaskPriority,
  TaskService,
  TaskStatus,
} from '../../core/services/task';
import {
  TaskFormDialogComponent,
  TaskFormDialogData,
} from '../task-form-dialog/task-form-dialog';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class TaskListComponent {
  protected readonly displayedColumns = ['title', 'status', 'priority', 'due_date', 'actions'];
  protected readonly dataSource = new MatTableDataSource<Task>([]);
  protected readonly statusOptions: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  protected readonly priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  protected isLoading = false;
  protected search = '';
  protected statusFilter: TaskStatus | '' = '';
  protected priorityFilter: TaskPriority | '' = '';

  @ViewChild(MatPaginator) protected paginator!: MatPaginator;
  @ViewChild(MatSort) protected sort!: MatSort;

  constructor(
    private readonly taskService: TaskService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (task, property) => {
      if (property === 'due_date') {
        return task.due_date ? new Date(task.due_date).getTime() : 0;
      }
      return (task as unknown as Record<string, string | number | null>)[property] ?? '';
    };
  }

  protected applyFilters(): void {
    this.fetchTasks();
  }

  protected resetFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.fetchTasks();
  }

  protected openCreateDialog(): void {
    this.openTaskDialog({ mode: 'create' });
  }

  protected openEditDialog(task: Task): void {
    this.taskService.getTask(task.id).subscribe({
      next: (fullTask) => this.openTaskDialog({ mode: 'edit', task: fullTask }),
      error: () => {},
    });
  }

  protected openDeleteDialog(task: Task): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '360px',
      data: { title: task.title },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.snackBar.open('Task deleted', 'Dismiss', { duration: 2000 });
          this.fetchTasks();
        },
        error: () => {},
      });
    });
  }

  protected formatStatus(value: TaskStatus): string {
    return value.replace('_', ' ');
  }

  protected formatPriority(value: TaskPriority): string {
    return value;
  }

  private fetchTasks(): void {
    this.isLoading = true;
    const filters: TaskFilters = {
      search: this.search || undefined,
      status: this.statusFilter || undefined,
      priority: this.priorityFilter || undefined,
    };

    this.taskService
      .getTasks(filters)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => {
          this.dataSource.data = tasks;
          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
        error: () => {},
      });
  }

  private openTaskDialog(data: TaskFormDialogData): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data,
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (!saved) {
        return;
      }
      this.fetchTasks();
    });
  }

}

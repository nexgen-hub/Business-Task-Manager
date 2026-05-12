import { Component } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { Task, TaskService, TaskStats } from '../../core/services/task';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class DashboardComponent {
  protected isLoading = false;
  protected userName = 'User';

  protected totalTasks = 0;
  protected completedTasks = 0;
  protected pendingTasks = 0;
  protected overdueTasks = 0;

  protected recentTasks: Task[] = [];

  protected readonly pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  protected readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  protected pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#f9a825', '#1e88e5', '#43a047'],
      },
    ],
  };

  protected barChartData: ChartData<'bar'> = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#4caf50', '#ffb300', '#e53935'],
      },
    ],
  };

  constructor(
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUsername();
    this.loadDashboardData();
  }

  protected trackByTaskId(_index: number, task: Task): number {
    return task.id;
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      tasks: this.taskService.getTasks(),
      stats: this.taskService.getMyStats(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ tasks, stats }) => {
          this.updateCards(tasks, stats);
          this.updateCharts(tasks, stats);
          this.recentTasks = [...tasks]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
        },
      });
  }

  private updateCards(tasks: Task[], stats: TaskStats): void {
    const now = new Date();
    this.totalTasks = tasks.length;
    this.completedTasks = stats.COMPLETED;
    this.pendingTasks = stats.PENDING;
    this.overdueTasks = tasks.filter(
      (task) => !!task.due_date && new Date(task.due_date) < now && task.status !== 'COMPLETED',
    ).length;
  }

  private updateCharts(tasks: Task[], stats: TaskStats): void {
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: [stats.PENDING, stats.IN_PROGRESS, stats.COMPLETED],
        },
      ],
    };

    const priorityCounts = tasks.reduce(
      (acc, task) => {
        acc[task.priority] += 1;
        return acc;
      },
      { LOW: 0, MEDIUM: 0, HIGH: 0 } as Record<'LOW' | 'MEDIUM' | 'HIGH', number>,
    );

    this.barChartData = {
      ...this.barChartData,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: [priorityCounts.LOW, priorityCounts.MEDIUM, priorityCounts.HIGH],
        },
      ],
    };
  }

}

from django.conf import settings
from django.db import models


class Task(models.Model):
	class Status(models.TextChoices):
		PENDING = 'PENDING', 'Pending'
		IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
		COMPLETED = 'COMPLETED', 'Completed'

	class Priority(models.TextChoices):
		LOW = 'LOW', 'Low'
		MEDIUM = 'MEDIUM', 'Medium'
		HIGH = 'HIGH', 'High'

	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
	due_date = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.title

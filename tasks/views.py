from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task
from .permissions import IsOwnerOrReadOnly
from .serializers import TaskListSerializer, TaskSerializer, UserSerializer


class TaskViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
	filter_backends = [filters.SearchFilter]
	search_fields = ['title', 'description']

	def get_queryset(self):
		queryset = Task.objects.filter(created_by=self.request.user)

		status_value = self.request.query_params.get('status')
		if status_value:
			queryset = queryset.filter(status=status_value)

		priority_value = self.request.query_params.get('priority')
		if priority_value:
			queryset = queryset.filter(priority=priority_value)

		return queryset

	def get_serializer_class(self):
		if self.action == 'list':
			return TaskListSerializer
		return TaskSerializer

	def perform_create(self, serializer):
		serializer.save(created_by=self.request.user)

	@action(detail=False, methods=['get'])
	def my_stats(self, request):
		status_counts = dict(
			Task.objects.filter(created_by=request.user)
			.values_list('status')
			.annotate(count=Count('id'))
		)

		response_data = {
			status_key: status_counts.get(status_key, 0)
			for status_key, _ in Task.Status.choices
		}
		return Response(response_data, status=status.HTTP_200_OK)


class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [permissions.AllowAny]

from datetime import timedelta
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from tasks.models import Task

try:
    from faker import Faker
except Exception:  # pragma: no cover
    Faker = None


class Command(BaseCommand):
    help = "Populate the database with sample users and tasks"

    USERS = [
        {"username": "john", "email": "john@example.com", "is_staff": False, "is_superuser": False},
        {"username": "jane", "email": "jane@example.com", "is_staff": False, "is_superuser": False},
        {"username": "admin", "email": "admin@example.com", "is_staff": True, "is_superuser": True},
    ]

    FALLBACK_TITLES = [
        "Prepare sprint planning notes",
        "Review client feedback",
        "Update onboarding checklist",
        "Fix dashboard export issue",
        "Organize product backlog",
        "Draft weekly team summary",
        "Follow up with vendor",
        "Refine API integration tasks",
        "Plan release smoke test",
        "Analyze bug trend report",
    ]

    FALLBACK_DESCRIPTIONS = [
        "",
        "",
        "Coordinate with design and engineering to ensure all edge cases are documented.",
        "This task requires collecting updates from multiple teams, validating assumptions, and preparing a concise recommendation for leadership.",
        "Double-check acceptance criteria and include screenshots where possible.",
        "",
    ]

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting sample data seeding..."))

        faker = Faker() if Faker else None
        if faker:
            self.stdout.write(self.style.NOTICE("Faker detected: using generated sample content."))
        else:
            self.stdout.write(self.style.WARNING("Faker not available: using hardcoded realistic sample content."))

        with transaction.atomic():
            users = self._create_or_update_users()
            self._seed_tasks_for_users(users, faker)

        self.stdout.write(self.style.SUCCESS("Sample data seeding completed."))

    def _create_or_update_users(self):
        user_model = get_user_model()
        created_users = []

        self.stdout.write(self.style.NOTICE("Creating or updating users..."))
        for user_data in self.USERS:
            user, created = user_model.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "email": user_data["email"],
                    "is_staff": user_data["is_staff"],
                    "is_superuser": user_data["is_superuser"],
                },
            )

            if created:
                user.set_password("password123")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"  Created user: {user.username}"))
            else:
                updated = False
                if user.email != user_data["email"]:
                    user.email = user_data["email"]
                    updated = True
                if user.is_staff != user_data["is_staff"]:
                    user.is_staff = user_data["is_staff"]
                    updated = True
                if user.is_superuser != user_data["is_superuser"]:
                    user.is_superuser = user_data["is_superuser"]
                    updated = True
                if updated:
                    user.save()
                    self.stdout.write(self.style.WARNING(f"  Updated user: {user.username}"))
                else:
                    self.stdout.write(self.style.NOTICE(f"  User already exists: {user.username}"))

            created_users.append(user)

        return created_users

    def _seed_tasks_for_users(self, users, faker):
        statuses = [
            Task.Status.PENDING,
            Task.Status.IN_PROGRESS,
            Task.Status.COMPLETED,
        ]
        priorities = [
            Task.Priority.LOW,
            Task.Priority.MEDIUM,
            Task.Priority.HIGH,
        ]

        now = timezone.now()

        self.stdout.write(self.style.NOTICE("Creating tasks for each user..."))
        for user in users:
            self.stdout.write(self.style.NOTICE(f"  Seeding tasks for {user.username}..."))

            existing_count = Task.objects.filter(created_by=user).count()
            if existing_count >= 8:
                self.stdout.write(self.style.WARNING(f"    Skipped: {user.username} already has {existing_count} task(s)."))
                continue

            for idx in range(8):
                title, description = self._build_content(faker, idx)

                # Ensure a mix of past and future due dates.
                if idx % 2 == 0:
                    due_date = now + timedelta(days=random.randint(1, 45))
                else:
                    due_date = now - timedelta(days=random.randint(1, 45))

                status_value = statuses[idx % len(statuses)]
                priority_value = priorities[(idx + 1) % len(priorities)]

                task = Task.objects.create(
                    title=title,
                    description=description,
                    status=status_value,
                    priority=priority_value,
                    due_date=due_date,
                    created_by=user,
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"    Created task #{idx + 1} for {user.username}: "
                        f"{task.title} ({task.status}, {task.priority})"
                    )
                )

    def _build_content(self, faker, idx):
        if faker:
            title = faker.sentence(nb_words=5).rstrip(".")
            description = "" if idx % 3 == 0 else faker.paragraph(nb_sentences=4)
            if idx % 5 == 0:
                description = faker.text(max_nb_chars=320)
            return title, description

        title = self.FALLBACK_TITLES[idx % len(self.FALLBACK_TITLES)]
        description = self.FALLBACK_DESCRIPTIONS[idx % len(self.FALLBACK_DESCRIPTIONS)]
        return title, description

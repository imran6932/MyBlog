"""
Django management command to monitor Celery tasks
"""
from django.core.management.base import BaseCommand
from celery import Celery
import time


class Command(BaseCommand):
    help = 'Monitor Celery tasks and worker status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--refresh',
            type=int,
            default=5,
            help='Refresh interval in seconds'
        )

    def handle(self, *args, **options):
        app = Celery('backend')
        app.config_from_object('django.conf:settings', namespace='CELERY')
        
        self.stdout.write(
            self.style.SUCCESS('Monitoring Celery tasks... (Press Ctrl+C to exit)')
        )
        
        try:
            while True:
                # Get worker stats
                inspect = app.control.inspect()
                
                # Check active workers
                stats = inspect.stats()
                if stats:
                    self.stdout.write(
                        self.style.SUCCESS(f'\n=== Active Workers: {len(stats)} ===')
                    )
                    for worker, info in stats.items():
                        self.stdout.write(f"Worker: {worker}")
                        self.stdout.write(f"  Pool: {info.get('pool', {}).get('max-concurrency', 'N/A')}")
                        self.stdout.write(f"  Total: {info.get('total', 'N/A')}")
                else:
                    self.stdout.write(
                        self.style.WARNING('No active workers found')
                    )
                
                # Check active tasks
                active_tasks = inspect.active()
                if active_tasks:
                    total_active = sum(len(tasks) for tasks in active_tasks.values())
                    self.stdout.write(
                        self.style.SUCCESS(f'\n=== Active Tasks: {total_active} ===')
                    )
                    for worker, tasks in active_tasks.items():
                        if tasks:
                            self.stdout.write(f"Worker: {worker}")
                            for task in tasks:
                                self.stdout.write(f"  Task: {task['name']} - {task['id'][:8]}...")
                else:
                    self.stdout.write('No active tasks')
                
                # Check scheduled tasks
                scheduled_tasks = inspect.scheduled()
                if scheduled_tasks:
                    total_scheduled = sum(len(tasks) for tasks in scheduled_tasks.values())
                    if total_scheduled > 0:
                        self.stdout.write(
                            self.style.SUCCESS(f'\n=== Scheduled Tasks: {total_scheduled} ===')
                        )
                
                self.stdout.write('\n' + '='*50)
                time.sleep(options['refresh'])
                
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.SUCCESS('\nMonitoring stopped.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error monitoring Celery: {e}')
            )

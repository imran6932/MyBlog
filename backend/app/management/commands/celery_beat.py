"""
Django management command to start Celery beat scheduler
"""
from django.core.management.base import BaseCommand
import os


class Command(BaseCommand):
    help = 'Start Celery beat scheduler for periodic tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loglevel',
            default='info',
            help='Set logging level (debug, info, warning, error, critical)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting Celery beat scheduler...')
        )
        
        # Prepare Celery beat command
        cmd = [
            'celery',
            '-A', 'backend',
            'beat',
            '--loglevel', options['loglevel'],
        ]
        
        # Execute the command
        try:
            os.execvp(cmd[0], cmd)
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(
                    'Celery not found. Make sure it is installed: pip install celery'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error starting Celery beat: {e}')
            )

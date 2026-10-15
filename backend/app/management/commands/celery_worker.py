"""
Django management command to start Celery worker
"""
from django.core.management.base import BaseCommand
import os
import sys


class Command(BaseCommand):
    help = 'Start Celery worker for background tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loglevel',
            default='info',
            help='Set logging level (debug, info, warning, error, critical)'
        )
        parser.add_argument(
            '--concurrency',
            type=int,
            default=4,
            help='Number of concurrent worker processes'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting Celery worker...')
        )
        
        # Prepare Celery worker command
        cmd = [
            'celery',
            '-A', 'backend',
            'worker',
            '--loglevel', options['loglevel'],
            '--concurrency', str(options['concurrency']),
        ]
        
        # Add platform-specific options for Windows
        if sys.platform == 'win32':
            cmd.extend(['--pool', 'solo'])
        
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
                self.style.ERROR(f'Error starting Celery worker: {e}')
            )

# Gunicorn configuration file for handling file uploads and long requests

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2

# Restart workers after this many requests, to prevent memory leaks
max_requests = 1000
max_requests_jitter = 100

# Restart workers if they haven't responded in this many seconds
timeout = 120
graceful_timeout = 120

# Maximum allowed size for a request (5MB for file uploads)
limit_request_field_size = 0
limit_request_fields = 32768
limit_request_line = 8190

# Preload the application before forking workers
preload_app = True

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'backend'

# Temporary directory for uploads
tmp_upload_dir = None

# SSL (if needed in future)
# keyfile = None
# certfile = None

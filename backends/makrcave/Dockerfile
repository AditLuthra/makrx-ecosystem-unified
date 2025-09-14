FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash makrcave
USER makrcave

# Expose port (default internal port; override with PORT env)
EXPOSE 8000

# Default runtime options for production containers
ENV USE_GUNICORN=true \
    METRICS_ENABLED=true

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${PORT:-8001}/health || exit 1'

# Start application
CMD ["/bin/sh", "start.sh"]

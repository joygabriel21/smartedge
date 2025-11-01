# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Set environment variable to enable .env loading
ENV PYTHONUNBUFFERED=1

# Run FastAPI with Uvicorn
CMD ["uvicorn", "fastapi.main:app", "--host", "0.0.0.0", "--port", "8000"]

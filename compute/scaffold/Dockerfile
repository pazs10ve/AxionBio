# AxionBio - Scaffold Container
# A lightweight image strictly for testing GCP Batch, Neon DB, and R2 connectivity.
FROM python:3.10-slim

WORKDIR /app

# Install minimal database requirements
COPY compute/shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

# Copy logic
COPY compute/shared/client.py /app/client.py
COPY compute/scaffold/main.py /app/main.py

# Env vars will be injected by GCP Batch at runtime
ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV GCS_BUCKET=""

CMD ["python", "/app/main.py"]

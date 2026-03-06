# AxionBio - REAL AlphaFold 3 Sandbox (Fixed for Flash-Attention)
# Using 'cudnn8-devel' image to provide NVCC, CUDA headers, and cuDNN for Flash-Attention/Torch
FROM nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04

# Avoid interaction during apt-get
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    python3.10 \
    python3.10-dev \
    python3.10-venv \
    python3-pip \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3.10 /usr/bin/python

WORKDIR /app

# 1. Clone the repository
RUN git clone https://github.com/google-deepmind/alphafold3.git /app/alphafold3

# 2. Pre-install BUILD-TIME dependencies for flash-attention
# Pinning numpy < 2 to avoid version conflicts with Torch 2.1.2
RUN pip install --no-cache-dir "numpy<2" setuptools wheel
RUN pip install --no-cache-dir packaging torch==2.1.2

# 3. Install JAX with CUDA 12 support
RUN pip install --no-cache-dir jax[cuda12] -f https://storage.googleapis.com/jax-releases/jax_cuda_releases.html

# 4. Install Flash-Attention (Requires NVCC from 'devel' image and torch installed above)
# Version 2.5.8 is highly compatible with Torch 2.1.2
RUN pip install --no-cache-dir flash-attn==2.5.8 --no-build-isolation

# 5. Install AlphaFold 3 remaining requirements
WORKDIR /app/alphafold3
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# 6. Install AxionBio shared logic
WORKDIR /app
COPY compute/shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

COPY compute/shared/client.py /app/client.py
COPY compute/alphafold3/main.py /app/main.py

# ── Env Vars injected by GCP Batch ──────────────────
ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV GCS_BUCKET=""

CMD ["python", "/app/main.py"]

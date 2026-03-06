# AxionBio - REAL OpenMM Sandbox
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y \
    wget \
    bzip2 \
    && rm -rf /var/lib/apt/lists/*

# Install Miniforge (Community-led, uses conda-forge by default, avoids Anaconda ToS issues)
RUN wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh -O miniforge.sh \
    && bash miniforge.sh -b -p /opt/conda \
    && rm miniforge.sh

ENV PATH="/opt/conda/bin:$PATH"

# Install OpenMM
RUN conda install -y openmm pdbfixer mdtraj python=3.10

WORKDIR /app

COPY compute/shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

COPY compute/shared/client.py /app/client.py
COPY compute/openmm/main.py /app/main.py

ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV GCS_BUCKET=""

CMD ["python", "/app/main.py"]

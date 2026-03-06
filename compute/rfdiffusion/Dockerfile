# AxionBio - REAL RFdiffusion Sandbox
FROM pytorch/pytorch:2.1.2-cuda11.8-cudnn8-devel

RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Clone the repository
RUN git clone https://github.com/RosettaCommons/RFdiffusion.git /app/RFdiffusion

WORKDIR /app/RFdiffusion

# Diagnostic step to ensure we are in the right folder
RUN ls -la

# 3. Install dependencies
RUN pip install --no-cache-dir dgl -f https://data.dgl.ai/wheels/cu118/repo.html
RUN pip install --no-cache-dir -e env/SE3Transformer

# If requirements.txt is missing, we try to install the root directly
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN pip install --no-cache-dir -e .

WORKDIR /app
COPY compute/shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

# Copy the AxionBio integration scripts
COPY compute/shared/client.py /app/client.py
COPY compute/rfdiffusion/main.py /app/main.py

ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV GCS_BUCKET=""

CMD ["python", "/app/main.py"]

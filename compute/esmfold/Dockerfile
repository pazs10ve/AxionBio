# AxionBio - REAL ESMFold Sandbox
FROM pytorch/pytorch:2.1.2-cuda11.8-cudnn8-runtime

RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Meta's ESM library
RUN pip install --no-cache-dir git+https://github.com/facebookresearch/esm.git

# Install BioPython for PDB writing
RUN pip install --no-cache-dir biopython

WORKDIR /app
COPY compute/shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

COPY compute/shared/client.py /app/client.py
COPY compute/esmfold/main.py /app/main.py

ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV R2_ENDPOINT=""
ENV R2_ACCESS_KEY_ID=""
ENV R2_SECRET_ACCESS_KEY=""
ENV R2_BUCKET=""

CMD ["python", "/app/main.py"]

# AxionBio - REAL RFdiffusion Sandbox
FROM pytorch/pytorch:2.1.2-cuda11.8-cudnn8-runtime

RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/RosettaCommons/RFdiffusion.git /app/RFdiffusion

WORKDIR /app/RFdiffusion
RUN pip install --no-cache-dir dgl -f https://data.dgl.ai/wheels/cu118/repo.html
RUN pip install --no-cache-dir -e env/SE3Transformer
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -e .

WORKDIR /app
COPY ../shared/requirements.txt /app/shared_reqs.txt
RUN pip install --no-cache-dir -r /app/shared_reqs.txt

# Copy the AxionBio integration scripts
COPY ../shared/client.py /app/client.py
COPY main.py /app/main.py

ENV DATABASE_URL=""
ENV JOB_ID=""
ENV WORKSPACE_ID=""
ENV USER_ID=""
ENV R2_ENDPOINT=""
ENV R2_ACCESS_KEY_ID=""
ENV R2_SECRET_ACCESS_KEY=""
ENV R2_BUCKET=""

CMD ["python", "/app/main.py"]

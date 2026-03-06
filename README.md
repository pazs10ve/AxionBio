# AxionBio

AxionBio is an enterprise-grade platform unifying computational biology and AI-driven drug discovery. It bridges the gap between state-of-the-art generative models (AlphaFold, RFdiffusion), high-performance computing, and cross-functional scientific collaboration.

---

## 🔬 Vision

The drug discovery process is fundamentally constrained by the friction between dry lab (computational) and wet lab (physical) operations. AxionBio provides a single pane of glass to design targets, run complex in-silico simulations, collaborate with AI, and order physical wet lab experiments seamlessly. By combining an intuitive Next.js frontend with an asynchronous, high-performance GPU compute backend, we are drastically accelerating the discovery pipeline.

## ✨ Core Features

- **Generative Engine & Simulations:** Natively integrate and dispatch jobs across state-of-the-art biological AI models, including AlphaFold3, RFdiffusion, ESM3, and Gromacs.
- **AI Copilot (Agentic Assistant):** A deeply integrated, context-aware AI agent that can converse about specific molecules, analyze complex structures, and independently dispatch compute jobs via multi-step tool calls.
- **Real-Time Job Telemetry:** Live progress bars and real-time streaming logs from asynchronous, ephemeral GPU sandboxes back to the browser. 
- **Interactive Molecular Visualization:** Built-in embedding of Molstar for interrogating protein and small molecule structures directly within the browser ecosystem.
- **Multi-Tenant Workspaces:** Enterprise-ready access control supporting multiple workspaces, projects, and role-based permissions (Scientist, PI, Admin).
- **Data Lake Integration:** Frictionless document and dataset management via integration with GCP Storage and AWS S3.
- **Lab Orders Pipeline:** Direct translation of in-silico structural hypotheses into physical lab orders (e.g. DNA/Protein synthesis).

## 🏗️ Architecture & Design Decisions

### 1. Serverless-First Application Layer
We opted for a low-overhead, highly-scalable Next.js 16 (App Router) execution environment mated to Neon's Serverless Postgres. This eliminates traditional infrastructure management while ensuring the platform efficiently scales with incoming web traffic and websocket connections.

### 2. Ephemeral GPU Sandboxing
Computational biology workloads are heavily demanding, often requiring A100/H100 GPUs and bespoke conda environments. Consequently, we employ a decoupled **“Fire-and-Forget” Dispatch Architecture**:
- The Next.js API delegates heavy scientific compute to **GCP Batch** and **Cloud Run** via internal, authenticated webhook calls.
- Jobs run in ephemeral sandboxes isolated from the web layer for security and raw compute density.

### 3. Direct-to-Database Log Streaming
Traditional architectures poll APIs or rely on heavy message queues (e.g., Kafka) to stream logs. In AxionBio, our Python compute workers (`compute/shared/client.py`) establish a direct Postgres connection using temporary credentials to insert append-only telemetry data (`job_logs`). The Next.js frontend then seamlessly pushes this data to users via modern React boundaries.

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS v4, Lucide React, Framer Motion
- Molstar (3D molecular rendering)
- React Query (Data Fetching Cache)

**Backend & Data Layer**
- Next.js API Routes (Server Actions)
- Neon (Serverless PostgreSQL)
- Drizzle ORM
- Vercel AI SDK & OpenAI (Agentic Copilot)
- Auth0 (`@auth0/nextjs-auth0` v4)

**Cloud & Infrastructure**
- Google Cloud Batch / Cloud Run (Compute execution)
- Google Cloud Storage (Bucket infrastructure)
- AWS SDK (S3 presigner interoperability)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Neon Postgres database instance
- Auth0 Application and API setup
- GCP / AWS buckets for file storage 

### Local Development

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure Environment Variables:**
   Duplicate the provided `.env.local.example` to `.env.local` and populate the required keys for Neon, Auth0, GCP, and OpenAI.

3. **Initialize the Database:**
   Generate and apply the Drizzle ORM schemas to your Neon instance.
   ```bash
   npx drizzle-kit push
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📄 License
*Private / Proprietary* — AxionBio

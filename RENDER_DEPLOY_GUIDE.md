# 🚀 Render Deployment Guide (render.com)
### Techronics Cyber Tic-Tac-Toe Full-Stack Architecture

This guide explains how to deploy the **Techronics Cyber Tic-Tac-Toe** full-stack application to [Render](https://render.com) using two methods:
1. **Method 1 (Recommended): 1-Click Infrastructure as Code (Blueprint `render.yaml`)**
2. **Method 2: Manual Dashboard Setup**

---

## 🏗️ Architecture Overview

The deployed system consists of 3 cloud components on Render:
1. **Managed PostgreSQL Database**: `techronics-db` (Free Tier)
2. **Backend Web Service**: `techronics-backend` (Spring Boot 3.3 + Java 17 running in an optimized multi-stage non-root Docker container)
3. **Frontend Static Site**: `techronics-frontend` (React 18 + Vite 5 + Tailwind CSS SPA with rewrite routing)

---

## ⚡ Method 1: 1-Click Deployment with Render Blueprint (Recommended)

Render Blueprints automatically parse `render.yaml` at the root of your repository and provision the database, backend, and frontend simultaneously with automated environment variable wiring.

### Step 1: Push Code to Git (GitHub or GitLab)
Ensure all code and the newly generated `render.yaml`, `Dockerfile`, and configuration files are committed and pushed to your remote repository:
```bash
git add .
git commit -m "Configure full-stack project for Render cloud deployment"
git push origin main
```

### Step 2: Create Blueprint Instance on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. In the top navigation, click **New +** → **Blueprint**.
3. Connect your GitHub / GitLab repository containing this project.
4. Render will detect `render.yaml` and display the resources to be created:
   - **Database**: `techronics-db`
   - **Web Service**: `techronics-backend`
   - **Static Site**: `techronics-frontend`
5. Click **Apply**.
6. Render will automatically:
   - Provision PostgreSQL.
   - Inject `DATABASE_URL` from the database directly into the backend service.
   - Build the backend Docker container and start the Spring Boot app on dynamic port `$PORT`.
   - Build the frontend Vite bundle and deploy the static site to a global CDN.

---

## 🛠️ Method 2: Manual Step-by-Step Dashboard Setup

If you prefer to configure the services manually using the Render Web Dashboard, follow these steps:

### Step 1: Create the Managed PostgreSQL Database
1. Go to **New +** → **PostgreSQL**.
2. Configure settings:
   - **Name**: `techronics-db`
   - **Database Name**: `techronics_db`
   - **User**: `techronics_user`
   - **Region**: `Oregon (US West)` (or closest to your users)
   - **Plan**: `Free`
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g. `postgres://techronics_user:pass@dpg-...-a:5432/techronics_db`).

---

### Step 2: Create the Backend Web Service
1. Go to **New +** → **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Name**: `techronics-backend`
   - **Region**: Same region as the database (e.g., `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: `backend` (or leave blank if using repository root Dockerfile)
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile` (or `Dockerfile`)
   - **Docker Build Context**: `backend` (or `.` if using root Dockerfile)
   - **Instance Type**: `Free`
4. Expand **Advanced** → **Environment Variables**:
   Add the following variables:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `postgres` | Activates PostgreSQL cloud profile & `DatabaseConfig` adapter |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Database connection string automatically converted to JDBC |
   | `JWT_SECRET` | `4c7f8a9e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a9a3f9e28f28b` | Strong 256-bit HMAC secret key for JWT authentication |
   | `CORS_ALLOWED_ORIGINS` | `https://techronics-frontend.onrender.com` | Allowed frontend origin for cross-origin API calls |

5. Set **Health Check Path**: `/api/quests/public`
6. Click **Create Web Service**.
7. Wait for the Docker build to complete. Note the public URL assigned by Render (e.g., `https://techronics-backend.onrender.com`).

---

### Step 3: Create the Frontend Static Site
1. Go to **New +** → **Static Site**.
2. Select your repository.
3. Configure settings:
   - **Name**: `techronics-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Redirects and Rewrites**, click **Add Rule**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   *(This ensures client-side React Router navigation works without 404 errors on page reload)*
5. Add **Environment Variables**:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://techronics-backend.onrender.com` | Deployed backend URL (normalized automatically to include `/api`) |

6. Click **Create Static Site**.

---

## 📋 Complete Environment Variable Reference

### Backend (`techronics-backend`):
| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto | `8080` | Dynamic HTTP port injected by Render container runtime |
| `SPRING_PROFILES_ACTIVE` | Yes | `postgres` | Activates `application-postgres.properties` & `DatabaseConfig` |
| `DATABASE_URL` | Yes | `postgres://user:pass@host:5432/db` | Render managed database connection string |
| `JWT_SECRET` | Yes | 64-char hex string | HMAC secret key used by Spring Security for JWT tokens |
| `CORS_ALLOWED_ORIGINS` | Optional | `https://*.onrender.com` | Comma-separated list of allowed frontend domains |

### Frontend (`techronics-frontend`):
| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://techronics-backend.onrender.com` | Target backend API URL (automatically normalized to `/api`) |

---

## 🔍 Verification & Health Checks

Once deployment completes:
1. **Public Health Check**:
   Open in your browser:
   `https://techronics-backend.onrender.com/api/quests/public`
   Should return HTTP 200 with JSON seed data.
2. **Database Auto-Seeding**:
   On the first launch, `DataInitializer` populates the PostgreSQL database with default cyber pilots (`CYBER_VIPER`, `NEXUS_GHOST`, `VOID_WALKER`) and tactical quests.
3. **Frontend Application**:
   Open `https://techronics-frontend.onrender.com`:
   - Navigate to `/login` or `/register`.
   - Register a new account or log in with default credentials (`CYBER_VIPER` / `CyberViper2026!`).
   - Launch Single Player or Local Multiplayer to test gameplay.

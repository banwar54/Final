# Quizenna - SRE Observability Stack

This project demonstrates how to integrate **Site Reliability Engineering (SRE)** practices in a Dockerized environment using:

- **Prometheus** (metrics collection)
- **Grafana** (dashboard & visualization)
- **Loki** (logging)
- **Custom backend/frontend** (target services being monitored)

---

## Overview

This repository contains a full-stack quiz application enhanced with observability tools to monitor system health, logs, and metrics using **Docker Compose**.

### Stack Components:

| Service     | Description                                   | Port   |
|-------------|-----------------------------------------------|--------|
| `backend`   | Quiz application backend (Node.js / TS)       | 5000   |
| `frontend`  | Frontend for the quiz application             | 5174   |
| `prometheus`| Collects and scrapes metrics from backend     | 9090   |
| `loki`      | Collects logs for Grafana visualization       | 3100   |
| `grafana`   | Visualizes logs & metrics in customizable dashboards | 3000   |

---

##  Running the Project

```bash
docker-compose up --build
```

Ensure that all required files (`prometheus.yml`, `dashboard.yml`, `datasources.yml`) and folders (`grafana/`, `prometheus/`) exist with proper paths.

---

## SRE Breakdown

---

### 1. **Prometheus - Metrics Collection**

Prometheus scrapes metrics from the backend service every **3 seconds**, as defined in `prometheus.yml`.

```yaml
global:
  scrape_interval: 3s

scrape_configs:
  - job_name: 'quiz-backend'
    static_configs:
      - targets: ['quiz-backend:5000']
```

> Prometheus is configured to look for metrics on the backend container’s port 5000. Make sure the backend exposes a `/metrics` endpoint (e.g., via `p
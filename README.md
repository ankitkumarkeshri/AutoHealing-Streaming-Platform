# AutoHealing Streaming Platform 

A scalable  system for a video streaming  built using Node.js, MongoDB, Redis, and Docker.

---

##  Project Overview

This project is a **containerized backend system** designed to simulate a real-world video streaming architecture.

It includes:

* API server (Node.js)
* Database (MongoDB)
* Cache layer (Redis)
* Persistent video storage
* Docker-based infrastructure

---

##  Architecture

```
Client → Backend API → Redis (Cache)
                       → MongoDB (Database)
                       → Video Storage (Local Volume)
```

---

##  Project Structure

```
streaming-platform/
│
├── backend/     # Node.js backend server
├── frontend/    # (Future) React/Next.js frontend
├── infra/       # DevOps & infrastructure configs
├── scripts/     # Automation scripts
├── videos/      # Persistent video storage
├── logs/        # Application logs
├── docs/        # Documentation
```

---

##  Tech Stack

* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Cache:** Redis
* **Containerization:** Docker, Docker Compose
* **Media Processing:** FFmpeg

---

##  Docker Setup

### 1. Build & Run Containers

```bash
docker compose up --build
```

### 2. Stop Containers

```bash
docker compose down
```

---

##  Services

| Service | Port  | Description |
| ------- | ----- | ----------- |
| Backend | 3000  | API server  |
| MongoDB | 27017 | Database    |
| Redis   | 6379  | Cache layer |

---

##  Volumes

* `videos/` → persistent storage for uploaded videos
* `mongo-data` → MongoDB data persistence

---

##  Important Notes

* Ensure ports **3000, 27017, 6379** are free before running
* Local MongoDB/Redis services should be stopped if using Docker containers
* Video files are stored locally and not pushed to GitHub

---

##  Current Features

* Dockerized backend system
* MongoDB integration
* Redis integration
* Persistent storage using volumes
* Basic streaming-ready backend structure

---

##  Future Work

This project will be extended into a full production-grade system:

### 🔹 Backend Improvements

* Clean architecture (controllers, services, routes)
* Retry & backoff logic for DB/Redis
* Centralized error handling
* Environment-based config management

### 🔹 Frontend

*  UI integration
* Video player integration
* Real-time streaming interface

### 🔹 DevOps & Scaling

* Kubernetes deployment
* CI/CD pipeline (Jenkins/GitHub Actions)
* Infrastructure as Code (Terraform)
* Reverse proxy (Nginx)

### 🔹 Observability

* Logging system (ELK Stack)
* Monitoring (Prometheus + Grafana)

### 🔹 Performance

* Caching strategies
* Load balancing
* Async processing (queues)

---

##  Goal

To evolve this into a **scalable, production-ready streaming platform** with full DevOps and distributed system capabilities.

---

##  Author

Built as part of a deep system design & DevOps learning journey.

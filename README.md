# Online Donation Platform (minimal scaffold)

## How to run locally (with Docker Compose)
1. Install Docker & Docker Compose.
2. From project root run: `docker compose up --build`
3. Frontend will be available at http://localhost:3000 and backend at http://localhost:8080

## Notes
- Backend uses MySQL (container `mysql`) with database `donationdb` and root password `password`.
- This scaffold is minimal: expand models, add authentication, proper frontend routing, payment integration, and AWS deployment as needed.

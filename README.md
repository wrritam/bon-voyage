# Bon Voyage 🚢

Bon Voyage is an AI-powered maritime voyage management system that provides fuel consumption prediction, route optimisation, and maintenance forecasting for ships.

## Features

- 🤖 *AI-Powered Predictions*: Machine learning models for fuel consumption and route optimisation
- ⛽ *Fuel Management*: Track and predict fuel usage across voyages
- 🗺️ *Route Optimisation*: Find optimal routes considering weather and cargo
- 🔧 *Maintenance Forecasting*: Predictive maintenance scheduling
- 📊 *Voyage Analytics*: Comprehensive voyage tracking and feedback
- 👥 *User Management*: Authentication and user-specific data

## Tech Stack

- *Backend*: Node.js, Express, TypeScript
- *Database*: PostgreSQL with Prisma ORM
- *AI/ML*: TensorFlow.js
- *Containerization*: Docker & Docker Compose
- *Package Manager*: pnpm

## Prerequisites

Before setting up the application, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v20.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Git](https://git-scm.com/downloads)

> *Note*: No need to install Node.js, pnpm, or PostgreSQL locally as they run inside Docker containers.

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd bon-voyage
```


### 2. Start the Application

```bash
docker-compose up --build
```


This single command will:
- Build the application Docker image
- Start PostgreSQL database
- Run database migrations
- Seed the database with sample data
- Train AI models
- Start the Express server

### 3. Access the Application

Once the setup is complete, you'll see:

🚢 Server is running on port 4000


The API will be available at: http://localhost:4000

## API Endpoints

### Authentication
- POST /auth/register - Register a new user
- POST /auth/login - Login user

### Voyages

- POST /voyage/plan-voyage - Create a new voyage and predict the details

### Plan History

- GET /voyage/plan-history - Compare actual and predicted data for all voyages
- GET /voyage/plan-history/:voyageId - Compare actual and predicted data for a specific voyage

### Maintenance
- GET /maintenance-alerts/:shipId - Get maintenance predictions

### Feedback
- POST /feedback/provide-feedback - Submit voyage feedback

## API Docs [Postman]
- [Postman publised documentation for all the APIS](https://documenter.getpostman.com/view/21414570/2sB34bL46o)

## Development Setup

For development with hot-reload and local debugging:

### 1. Install Dependencies Locally

bash
# Install Node.js (v18+) and pnpm
```
npm install -g pnpm
pnpm install
```


### 2. Setup Environment Variables

Create a .env file in the root directory:

env
```bash
DATABASE_URL="postgresql://postgres:password123@localhost:5432/bon_voyage"
DIRECT_URL="postgresql://postgres:password123@localhost:5432/bon_voyage"
PORT=3000
JWT_SECRET="your-secret-key-here"
```


### 3. Run Database Migrations and Seed

```bash
pnpm db:push
pnpm db:generate
pnpm seed
```


### 4. Start Development Server

```bash
pnpm dev
```


## Available commands

```bash
# Development
pnpm dev              # Start development server with nodemon
pnpm build            # Build TypeScript to JavaScript
pnpm start            # Start production server
```
```
# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
pnpm db:studio        # Open Prisma Studio
pnpm seed             # Seed database with sample data
```
```
# AI/ML
pnpm train            # Train AI models manually
```


## Docker Commands

```bash
# Start all services
docker-compose up
```
```bash
# Rebuild and start
docker-compose up --build
```
```bash
# Stop all services
docker-compose down
```
```bash
# View logs
docker-compose logs app
docker-compose logs postgres
```

## Database Schema

The application uses the following main entities:

- *Users*: Authentication and user management
- *Ships*: Fleet management
- *Voyages*: Trip planning and tracking
- *FuelLogs*: Fuel consumption tracking
- *VoyageFeedback*: Post-voyage analytics
- *MaintenanceRecords*: Equipment maintenance tracking

## AI Models

The application includes three AI models that are automatically trained on startup:

1. *Fuel Predictor*: Predicts fuel consumption based on distance, cargo weight, weather conditions
2. *Route Optimizer*: Optimizes routes considering weather and cargo constraints
3. *Maintenance Forecaster*: Predicts maintenance needs based on usage patterns

## Container Issues (I personally faced these problems)

-*Problem*: exec ./docker-entrypoint.sh: no such file or directory
-*Solution*: This is usually a line-ending issue. The Dockerfile includes dos2unix to handle this automatically.

-*Problem*: Cannot find module '/app/dist/server.js'
-*Solution*: Ensure you're not using volume mounts that override the built image in production.

-*Problem*: The table 'public.voyages' does not exist
-*Solution*: Run database migrations:
```bash
docker-compose exec app pnpm db:push
```

-*Problem*: Connection refused to PostgreSQL
-*Solution*: Ensure PostgreSQL container is running:
```bash
docker-compose up postgres -d
```

-*Problem*: Slow AI model training
-*Solution*: The app includes TensorFlow.js CPU backend. For faster training, you can:
   - Use a machine with more CPU cores
   - The models train once on startup and save to disk

## How my system supports planning intelligence

### This Project, Bon Voyage works with AI/ML to provide data oriented decision support for Marine Operations. 
- #### Planning the voyage & Fuel Prediction: 
  the ``/plan-voyage``  optimal speed and fuel consumption based on cargo weight, distance, and weather. This allows operators to plan cost-efficient and timely routes. A regression model forecasts fuel usage, enabling better refueling decisions and cost management.

- #### Route Optimization:
  The system estimates voyage duration and recommends a dynamic speed schedule across segments, improving ETA predictions and voyage efficiency.

- #### Maintenance Forecasting:
  Based on historical fuel logs and maintenance records, the system predicts the next due maintenance date, readiness time, and health score for each ship.

- #### Continuous learning loop for more accurate datas:
  With ```/feedback``` endpoints and model retraining schedules, the system evolves using real operational data, improving over time with usage.

- #### Added AIModel:
  For savimg each training model's version, accuracy and metadata for reliability.

---

*Happy Sailing! ⛵*

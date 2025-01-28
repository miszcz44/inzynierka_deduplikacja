# Project Setup and Deployment

This guide explains how to set up and deploy the project, including the backend, frontend, database, and Jupyter Notebook environment.

## Prerequisites

Ensure you have the following tools installed on your system:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
.
├── app/                   # Backend application
├── frontend/              # Frontend application
├── data_pipeline/         # Jupyter Notebook setup and data pipeline
├── docker-compose.yml     # Docker Compose configuration
├── requirements.txt       # Python dependencies for the backend
├── nginx.conf             # Nginx configuration for the frontend
```

## How to Run the Project

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Set Up the Environment Variables

Create a `.env` file in the root directory to set up environment variables (optional, if not already handled in `docker-compose.yml`). Example:

```env
POSTGRES_USER=db_user
POSTGRES_PASSWORD=password
POSTGRES_DB=inzynierka_db
```

### 3. Build and Start the Containers

Use Docker Compose to build and start all services:

```bash
docker-compose up --build
```

This will:
- Start the PostgreSQL database.
- Build and run the backend with FastAPI.
- Build and serve the frontend using Nginx.
- Start the Jupyter Notebook environment for the data pipeline.

### 4. Access the Services

- **Backend (FastAPI)**: [http://localhost:8000](http://localhost:8000)
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Jupyter Notebook**: [http://localhost:8888](http://localhost:8888)

> For Jupyter Notebook, you'll need the token provided in the terminal output when the container starts.

### 5. Manage Database Data

The PostgreSQL database data is persisted in the `postgres_data` Docker volume. If you need to access the database directly, use the credentials specified in the `docker-compose.yml` file or the `.env` file.

### 6. Stopping the Project

To stop all containers, run:

```bash
docker-compose down
```

To stop and remove all containers, volumes, and networks:

```bash
docker-compose down -v
```

## Additional Notes

### Backend (FastAPI)

- **Requirements**: Python dependencies are specified in `requirements.txt`.
- **Run Locally**: To run the backend without Docker:

  ```bash
  cd app
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 8000
  ```

### Frontend (React)

- **Requirements**: Node.js dependencies are managed via `package.json`.
- **Run Locally**: To run the frontend without Docker:

  ```bash
  cd frontend
  npm install
  npm start
  ```

### Jupyter Notebook

- **Dockerfile Location**: `data_pipeline/Dockerfile`.
- **Run Locally**: To run Jupyter Notebook without Docker:

  ```bash
  cd data_pipeline
  pip install -r requirements.txt
  jupyter notebook
  ```

## Troubleshooting

### Common Issues

- **Port Conflicts**: Ensure ports `8000`, `3000`, and `8888` are not in use by other applications.
- **Docker Build Issues**: Clear Docker cache if you encounter build errors:

  ```bash
  docker-compose build --no-cache
  ```

- **Database Connection Errors**: Ensure the database container is running and the credentials match the `docker-compose.yml` or `.env` configuration.

### Logs

To view logs for a specific service:

```bash
docker-compose logs <service-name>
```

Replace `<service-name>` with `db`, `web`, `frontend`, or `jupyter` as needed.

## License

This project is licensed under [MIT License](LICENSE).

## Contributing

Feel free to open issues or submit pull requests for improvements!


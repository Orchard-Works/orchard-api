# Orchard Backend

Orchard Backend is a Strapi-based application that serves as the backend for the Orchard.works platform. It provides APIs for managing organizations, channels, users, and invitations.

## 🚀 Features

- User authentication and authorization
- Organization management
- Channel creation and management
- User invitations for organizations and channels
- Seat type management
- Email notifications using SendGrid

## 🛠 Tech Stack

- [Strapi](https://strapi.io/) - Headless CMS
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Docker](https://www.docker.com/) - Containerization
- [GitHub Actions](https://github.com/features/actions) - CI/CD

## 🏗 Project Structure

The project follows the standard Strapi structure with some custom configurations:

- `/config`: Configuration files for the Strapi application
- `/src`: Source code for the application
  - `/api`: API definitions for various content types
  - `/extensions`: Custom extensions for Strapi plugins
- `/public`: Public assets
- `/.github/workflows`: GitHub Actions workflow for CI/CD

## 🚦 Getting Started

### Prerequisites

- Node.js (version 18.x or 20.x)
- npm or yarn
- PostgreSQL database

### Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd orchard-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the `.env.example` file to `.env` and update the environment variables:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run develop
   ```

The Strapi admin panel will be available at `http://localhost:1337/admin`.

### Docker Deployment

The project includes a `Dockerfile` and `docker-compose.yml` for easy deployment:

1. Build the Docker image:
   ```
   docker build -t orchard-backend .
   ```

2. Start the container:
   ```
   docker-compose up -d
   ```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:1337/documentation
```

This provides an interactive Swagger UI for exploring and testing the APIs.

## 🔐 Authentication

The project uses Strapi's built-in authentication system. To authenticate:

1. Register a new user or log in with existing credentials
2. Use the provided JWT token in the `Authorization` header for subsequent requests

## 🔧 Configuration

Key configuration files:

- `config/server.js`: Server configuration
- `config/database.js`: Database configuration
- `config/plugins.js`: Plugin configurations (e.g., email provider)

## 📨 Email Notifications

The project uses SendGrid for sending email notifications. Configure your SendGrid API key in the `.env` file:

```
SENDGRID_API_KEY=your_sendgrid_api_key
```

## 🚢 Deployment

The project includes a GitHub Actions workflow for automated deployment:

1. Push changes to the `main` branch
2. The workflow builds a Docker image and pushes it to GitHub Container Registry
3. The image is then deployed to the specified server

Ensure all required secrets are set in your GitHub repository settings.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

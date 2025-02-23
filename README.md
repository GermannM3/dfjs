# DrillFlow Telegram Bot

DrillFlow is an automated platform for distributing drilling orders between contractors based on geolocation, rating, and workload.

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd drillflow-bot
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. The bot will be running and connected to Telegram.
   - API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Production Deployment

1. Build and start the production environment:
   ```bash
   docker-compose up --build -d
   ```

## Features

- Contractor registration and verification
- Automated order distribution
- Rating system
- Payment integration
- Real-time notifications
- Admin panel
- Public statistics dashboard

## Project Structure

```
src/
├── bot/            # Telegram bot handlers
├── config/         # Configuration files
├── models/         # Database models
├── services/       # Business logic
├── utils/          # Helper functions
└── index.js        # Application entry point
```

## Testing

Run tests:
```bash
npm test
```

## Security Features

- SSL/TLS encryption
- JWT authentication
- Rate limiting
- IP-based fraud prevention
- Regular security audits

## Documentation

API documentation and additional guides can be found in the `docs/` directory.
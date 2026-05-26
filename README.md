# My German Notes

A fullstack web application for learning German with personalized notes, built with React frontend and Node.js backend.

## Features

- 🔐 User authentication (login/signup)
- 📱 Responsive design
- 🛡️ Secure JWT-based authentication
- 💾 SQLite for development, PostgreSQL for production
- 🚀 Ready for deployment

## Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js
- Express.js
- SQLite (development) / PostgreSQL (production)
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security
- CORS support
- Rate limiting

## Project Structure

```
My_German_Notes/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
├── config/                 # Database configuration
├── controllers/           # Route controllers
├── middleware/            # Express middleware
├── models/               # Database models
├── routes/               # API routes
├── scripts/              # Utility scripts
├── .env                  # Environment variables
├── .env.example         # Environment template
├── package.json         # Backend dependencies
└── server.js           # Main server file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite3 (for development)
- PostgreSQL (for production, optional)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd My_German_Notes
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment variables
cp .env.example .env

# Initialize database
npm run init-db
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Go back to root directory
cd ..
```

### 4. Environment Configuration

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Database Configuration
# For development (SQLite)
DB_TYPE=sqlite
SQLITE_DB_PATH=./database/german_notes.db

# For production (PostgreSQL)
# DB_TYPE=postgresql
# DATABASE_URL=postgresql://username:password@localhost:5432/german_notes
```

**Important:** Change the `JWT_SECRET` to a strong, unique secret key before deploying to production.

## Running the Application

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

```bash
# Build frontend
cd client
npm run build
cd ..

# Start backend
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile (protected) |
| PUT | `/api/auth/profile` | Update user profile (protected) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER/SERIAL | Primary key |
| username | TEXT/VARCHAR(50) | Unique username |
| email | TEXT/VARCHAR(100) | Unique email |
| password | TEXT/VARCHAR(255) | Hashed password |
| created_at | DATETIME/TIMESTAMP | Creation date |
| updated_at | DATETIME/TIMESTAMP | Last update date |

## Authentication Flow

1. User registers with username, email, and password
2. Password is hashed using bcryptjs
3. JWT token is generated and returned
4. Token is stored in localStorage on frontend
5. Token is sent in Authorization header for protected routes
6. Backend validates token and extracts user information

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- SQL injection protection

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | Token expiration | 7d |
| DB_TYPE | Database type | sqlite |
| SQLITE_DB_PATH | SQLite file path | ./database/german_notes.db |
| DATABASE_URL | PostgreSQL URL | (optional) |

## Deployment

### Heroku

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Add PostgreSQL addon
4. Deploy using Git

### Environment Variables for Production

```env
NODE_ENV=production
DB_TYPE=postgresql
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_very_secure_secret_key
```

## Scripts

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database tables
```

### Frontend Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Future Features

- 📝 German vocabulary notes management
- 📚 Grammar lessons and exercises
- 🔄 Flashcard system for vocabulary
- 📊 Learning progress tracking
- 🎯 Personal learning goals
- 📱 Mobile app version
- 🔊 Audio pronunciation
- 📖 Dictionary integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Happy German Learning! 🇩🇪**
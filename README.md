# Real-Time Disaster Alert System with Google Maps Integration

A comprehensive disaster alert system with real-time notifications, location-based filtering, Google Maps integration, and role-based access control.

## Features

### Admin Features
- Secure Admin login
- Create disaster alerts by selecting locations on Google Maps
- Set type (Flood, Earthquake, Cyclone, etc.), severity, tips
- View and manage all alerts
- View all registered users

### User Features
- Register/Login
- Allow location access to receive geo-targeted alerts
- View real-time alerts with disaster details and location on map
- Receive safety tips based on location & disaster type

## Tech Stack

### Frontend
- Next.js 14 (React)
- Tailwind CSS
- Google Maps JavaScript API
- Socket.io Client for real-time updates

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Google Maps API Key

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/disaster-alert-system.git
cd disaster-alert-system
\`\`\`

2. Install frontend dependencies
\`\`\`bash
npm install
\`\`\`

3. Install backend dependencies
\`\`\`bash
cd server
npm install
cd ..
\`\`\`

4. Set up environment variables
Create a `.env` file in the server directory with:
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/disaster-alerts
JWT_SECRET=your_jwt_secret_key_here
JWT_LIFETIME=30d
FRONTEND_URL=http://localhost:3000
\`\`\`

Create a `.env.local` file in the root directory with:
\`\`\`
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
\`\`\`

### Running the Application

1. Start the backend server
\`\`\`bash
npm run server
\`\`\`

2. In a new terminal, start the frontend
\`\`\`bash
npm run dev
\`\`\`

3. Open your browser and navigate to `http://localhost:3000`

## Default Login Credentials

### Admin
- Email: admin@example.com
- Password: admin123

### User
- Email: user@example.com
- Password: user123

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions
- `/server` - Backend Express server
  - `/models` - Mongoose models
  - `/controllers` - Route controllers
  - `/routes` - API routes
  - `/middleware` - Auth middleware
  - `index.js` - Server entry point
  - `seed.js` - Database seeding script

## Future Enhancements

- Push notifications
- Mobile app with React Native
- Integration with real weather/disaster APIs
- Advanced analytics dashboard
- Multi-language support

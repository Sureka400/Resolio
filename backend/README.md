# Resolio Backend - Complete Setup Guide

Backend API for the Resolio educational platform built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://cloud.mongodb.com/)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your settings
# Required: Update MONGODB_URI if using cloud database
```

### 3. Start MongoDB
**Option A: Local MongoDB**
```bash
# Windows: Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resolio
```

### 4. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

### 5. Test the API
Open your browser and visit:
- **Health Check**: http://localhost:3001/api/health
- **API Test**: http://localhost:3001/api/test

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Students (Requires Authentication)
- `GET /api/students/dashboard` - Student dashboard data
- `GET /api/students/courses` - Student's enrolled courses
- `GET /api/students/courses/:id` - Course details
- `GET /api/students/assignments` - Student's assignments
- `POST /api/students/assignments/:id/submit` - Submit assignment
- `GET /api/students/grades` - Student's grades
- `PUT /api/students/profile` - Update student profile

### Teachers (Requires Authentication)
- `GET /api/teachers/dashboard` - Teacher dashboard data
- `GET /api/teachers/courses` - Teacher's courses
- `POST /api/teachers/courses` - Create new course
- `GET /api/teachers/courses/:id` - Course details
- `POST /api/teachers/courses/:id/assignments` - Create assignment
- `GET /api/teachers/assignments` - Teacher's assignments
- `PUT /api/teachers/assignments/:id/submissions/:sid/grade` - Grade submission
- `GET /api/teachers/students` - Teacher's students

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/assignments` - Get course assignments

### Assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `GET /api/assignments/:id/submissions` - Get assignment submissions
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

## 🔧 Configuration

### Environment Variables (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/resolio
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Database Models
- **User**: Students, teachers, and admins
- **Course**: Course information and enrollment
- **Assignment**: Assignments with submissions and grades

## 🧪 Testing the API

### Using cURL
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3001/api`
3. Test authentication and student endpoints

## 🚀 Deployment

### For Production
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "resolio-backend"
   ```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- **Local MongoDB not starting**: Make sure MongoDB service is running
- **Connection refused**: Check if MongoDB is running on port 27017
- **Cloud connection**: Verify MongoDB Atlas IP whitelist includes your IP

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Common Errors
- **"requireTeacherAuth is not defined"**: Make sure all middleware imports are correct
- **"MongoDB connection error"**: Check MongoDB URI and network connectivity
- **"JWT token invalid"**: Verify JWT_SECRET is set correctly

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Test with the `/api/health` endpoint first
4. Check MongoDB connection status

## 📝 Next Steps

After setting up the backend:
1. Connect your React frontend to these API endpoints
2. Implement authentication in the frontend
3. Add file upload functionality for assignments
4. Set up email notifications
5. Add real-time features with WebSockets

---

**Happy coding! 🎓**
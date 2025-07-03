# Photo Upload Web Application

A full stack web application for uploading and viewing photos with authentication.

## Tech Stack

- **Frontend:** React, Material-UI, Axios
- **Backend:** Node.js, Express, SQLite, Multer, JWT

## Features
- User signup and login
- Dashboard with photo upload button
- Photo gallery
- Authentication (JWT)

## Project Structure

```
/bugweb
  /client   # React frontend
  /server   # Express backend
```

## Getting Started

### 1. Backend Setup
```sh
cd server
npm install
npm start
```

### 2. Frontend Setup
```sh
cd client
npm install
npm start
```

### 3. Open in Browser
Visit: http://localhost:3000

---

## Development
- The backend now uses SQLite. No MongoDB setup is required.
- The backend runs on port 5000 by default.
- The frontend runs on port 3000 by default.

---

## Deployment
- The backend API is deployed at https://bugweb.onrender.com
- The frontend should use this URL for all API requests.

---

## Next Steps
- Scaffold backend and frontend code.
- Implement authentication and photo upload features.

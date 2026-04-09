# Budgeto - Expense Tracker

A full-stack (MERN) expense tracking application with AI receipt scanning, group expenses, and visualization.

## 🚀 Quick Start (Development)

1. **Clone the repository**
2. **Install Dependencies** (Root, Client, and Server)
   ```bash
   npm run install-all
   ```
3. **Setup Environment Variables**
   - Copy `server/.env.example` to `server/.env` and fill in your details (MongoDB URI, JWT Secret).
   - Copy `client/.env.example` to `client/.env` (optional for local).
4. **Run Locally**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 🏗️ Production Build

To build the application for production:

1. **Build the client**
   ```bash
   npm run build
   ```
2. **Start the server**
   ```bash
   NODE_ENV=production npm start
   ```
   In production mode, the Express server serves the React frontend from the `client/dist` folder.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Framer Motion, TailwindCSS, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Other**: Tesseract.js (OCR), JWT Authentication.

## 📁 Project Structure

- `/client`: React application (Vite).
- `/server`: Node.js/Express API.
- `/package.json`: Root manager for both.

## 🔒 Security

- Sensitive data is managed via environment variables.
- `.env` files are ignored by Git.
- Ensure `JWT_SECRET` and `MONGO_URI` are kept private.

---
*Ready to be pushed to GitHub.*

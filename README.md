# Budgeto — Next-Gen Financial Intelligence 🚀

Budgeto is a premium, full-stack financial management platform designed to give you complete control over your money. Combining sleek aesthetics with powerful features like **AI-powered receipt scanning**, **multi-currency support**, and **group expense splitting**, Budgeto turns the chore of expense tracking into an intuitive, data-driven experience.

![Dashboard Preview](https://github.com/Swapnil3425/Budgeto---Expense-Tracker/raw/main/preview.png) *(Note: Add your own screenshot here)*

## ✨ Key Features

- **📊 Intelligent Dashboard**: Real-time KPI cards for balance, spending, income, and remaining budget with AI-driven financial insights.
- **🧾 AI Receipt Scanner**: Extract vendor, amount, and date automatically from images using Tesseract.js OCR directly in your browser.
- **📅 Expense Calendar**: Visualize your spending patterns across the month with an interactive heatmap and daily detail view.
- **🎯 Savings Goals**: Create, track, and manage long-term savings targets with progress visualizations.
- **👥 Group Splitter**: Manage shared expenses with friends or roommates; track who owes what and settle balances with ease.
- **💱 Multi-Currency Support**: View your finances in any currency with live exchange rates (INR base).
- **📈 Advanced Analytics**: Deep dive into your spending habits with interactive Pie and Area charts powered by Recharts.
- **🌓 Premium UI/UX**: A state-of-the-art dark theme built with Framer Motion for smooth transitions and a glassmorphism aesthetic.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Framer Motion, Lucide React |
| **Styling** | Vanilla CSS (Modular), Glassmorphism Design System |
| **Charts** | Recharts (Responsive SVG) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JWT Authentication, BCrypt Hashing, Helmet, CORS |
| **Utility** | Tesseract.js (OCR), Axios, Date-fns |

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Swapnil3425/Budgeto---Expense-Tracker.git
   cd Budgeto---Expense-Tracker
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

4. **Launch the app**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 🏗️ Project Architecture

```text
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Core application views
│   │   ├── store/       # Redux Toolkit slices
│   │   └── services/    # API configuration (Axios)
├── server/              # Node.js backend
│   ├── models/          # Mongoose Schema definitions
│   ├── routes/          # API Endpoint handlers
│   └── middleware/      # Auth & Error handling
└── root/                # Monorepo management
```

## 🔒 Security & Deployment

- **Data Isolation**: Strict user-level data isolation ensures you only see your own finances.
- **Production Ready**: Optimized Express server for serving static assets and handling API requests securely.
- **Deployment**: Configured for seamless deployment on Render (Backend) and Vercel (Frontend).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Swapnil](https://github.com/Swapnil3425) 🚀

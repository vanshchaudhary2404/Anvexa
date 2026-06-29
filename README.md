# ✨ Anvexa

### Discover More, Shop Smarter.

Anvexa is a modern Full-Stack E-Commerce SaaS Platform built using the MERN Stack. It provides a complete online shopping ecosystem with secure authentication, product management, order processing, payment integration, analytics, cloud media storage, and role-based administration.

---

## 🚀 Features

### Customer Features

- User Registration & Login
- JWT Authentication
- Product Browsing
- Product Search & Filtering
- Shopping Cart
- Secure Checkout
- Razorpay Payment Gateway(in progress)
- Order Tracking
- User Profile Management
- Order History

### Admin Features

- Admin Dashboard
- Product Management (CRUD)
- Order Management
- User Monitoring
- Revenue Analytics
- Monthly Sales Reports

---

## 🏗️ Tech Stack

### Frontend

- React.js
- Redux Toolkit
- React Router DOM
- Axios
- tailwind

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

### Third-Party Services

- Razorpay
- Cloudinary
- Nodemailer

### Deployment

- Render
- MongoDB Atlas

---

## 📂 Project Architecture (will upload soon)

---

# Anvexa
Major Project is Loading....

📖 **[Read the Documentation](###)**
<!-- https://1drv.ms/w/c/d503fb3325128f00/IQBuHhlgOtIxQ52EcGvqupgTAWNkkWHqUsdFjXcptsvYOAg?e=cyuIrN -->

# In package.json
"scripts": {
    "install": "cd backend && npm install && cd ../frontend && npm install",
    "dev:server": "cd backend && npm run dev",
    //for my client folder using vite
    "dev:client": "cd client && npm run dev",
    //for my frontend project using creat react-app
    "dev:client": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "build": "cd frontend && npm run build"
  },

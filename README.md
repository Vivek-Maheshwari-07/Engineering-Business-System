# 🏢 Hari Krupa Engineering System (ERP)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)

A full-stack, enterprise-grade **Engineering Business Management System (ERP)** designed to streamline daily operations for manufacturing, trading, and engineering businesses. It integrates Inventory, Orders, GST Billing, Role-Based Access Control (RBAC), Salary Processing, and dynamic Reporting into a single, cohesive platform.

---

## 📖 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation Steps](#-installation-steps)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [How to Run](#-how-to-run-project)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Author Info](#-author-info)

---

## 📝 Description

The **Hari Krupa Engineering System** is designed to eliminate paper-based workflows and fragmented Excel sheets. Built specifically for industrial suppliers and engineering firms, it allows **Owners**, **Employees**, and **Customers** to interact in real-time. 

From managing dynamic product variants and stock levels, to generating compliant GST invoices and processing employee payroll, this ERP provides a robust digital infrastructure.

---

## ✨ Features

- 🔐 **Role-Based Authentication (RBAC)**: Distinct dashboards and permissions for `owner`, `employee`, and `customer`. Secure JWT sessions with OTP email verification.
- 📦 **Product & Inventory Management**: Track complex products with multiple variants, sizes, and pricing. Real-time low-stock alerts.
- 🛒 **Order Management**: Customers can place orders directly. Employees/Owners track statuses (`Pending`, `Partial`, `Completed`, `Cancelled`).
- 📄 **Automated GST Invoicing**: Generate and print professional, industry-compliant PDF tax invoices with dynamic HSN codes and Amount-to-Words calculations.
- 💳 **Payment Management**: Support for partial payments and outstanding balance tracking.
- 💼 **Salary Management**: Generate monthly payroll slips for employees. Employees have a dedicated portal to download their payslips.
- 📧 **Email Notification System**: Asynchronous, fail-safe Nodemailer integration for OTPs, Order Confirmations, and status updates.
- 📊 **Reports & Analytics**: Visual charts (Recharts) for revenue trends, top-selling products, and GST collection summaries.

---

## 🛠 Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS (Custom White + Green Theme)
- React Router DOM
- Lucide React (Icons)
- Recharts (Data Visualization)
- JSPDF & HTML2Canvas (PDF Generation)

**Backend:**
- Node.js & Express.js
- MySQL (mysql2/promise)
- JSON Web Token (JWT)
- Nodemailer (Email Integration)
- Bcrypt.js (Password Hashing)

---

## 📂 Project Structure

```text
Hari-Krupa-ERP/
├── backend/
│   ├── config/          # DB connection & Nodemailer config
│   ├── controllers/     # Business logic (Auth, Orders, Products, etc.)
│   ├── middleware/      # JWT verification & RBAC checks
│   ├── models/          # SQL queries & DB abstractions
│   ├── routes/          # Express API route definitions
│   ├── scripts/         # DB seeders and utility scripts
│   ├── uploads/         # Static assets (Product Images)
│   ├── utils/           # Helper functions
│   └── server.js        # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, Sidebar, Button)
│   │   ├── context/     # React Context (AuthContext)
│   │   ├── pages/       # Route Views (Dashboard, Orders, Invoice, etc.)
│   │   ├── routes/      # Protected Route Wrappers
│   │   ├── services/    # Axios API hooks
│   │   ├── App.jsx      # Main Router
│   │   └── main.jsx     # Frontend entry point
│   ├── index.html       
│   └── vite.config.js   
│
└── README.md
```

---

## 🚀 Installation Steps

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hari-krupa-erp.git
cd hari-krupa-erp
```

### 2. Install Dependencies
You can install dependencies for both frontend and backend concurrently:
```bash
# In the root folder
npm install

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=engineering_erp

JWT_SECRET=super_secret_jwt_key_that_should_be_long_in_production
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```
> **Note:** To send emails via Nodemailer, you must generate an [App Password](https://support.google.com/accounts/answer/185833?hl=en) in your Google Account.

---

## 🗄️ Database Setup

1. Open MySQL Workbench or your preferred CLI.
2. Run the SQL initialization script located at `database/schema.sql`:
```bash
mysql -u root -p < database/schema.sql
```
This will automatically create the `engineering_erp` database, build all necessary tables, and configure foreign key constraints.

---

## 💻 How to Run Project

We have configured a root `package.json` to start both servers simultaneously.

From the root directory, run:
```bash
npm start
```

- **Frontend** will be running at: `http://localhost:5173`
- **Backend** will be running at: `http://localhost:5000`

---

## 📸 Screenshots

| Dashboard | Product Catalog |
| :---: | :---: |
| ![Dashboard Screenshot Placeholder](https://via.placeholder.com/600x350/ffffff/16a34a?text=Dashboard+Overview) | ![Products Screenshot Placeholder](https://via.placeholder.com/600x350/ffffff/16a34a?text=Product+Catalog) |

| Order Management | Professional Invoice |
| :---: | :---: |
| ![Orders Screenshot Placeholder](https://via.placeholder.com/600x350/ffffff/16a34a?text=Order+Management) | ![Invoice Screenshot Placeholder](https://via.placeholder.com/600x350/ffffff/16a34a?text=Industrial+Invoice+PDF) |

---

## 🔮 Future Enhancements

- **Integration with Tally Prime**: Export financial data directly to XML format compatible with Tally.
- **Barcode/QR Code Scanner**: Mobile app integration to scan incoming/outgoing stock.
- **Supplier Portal**: A dedicated portal for raw material suppliers to bid and manage purchase orders.
- **Advanced Tax Computation**: Multi-state GST support (IGST) auto-calculations based on customer shipping addresses.

---

## 👨‍💻 Author Info

**Developed by:** [Your Name / Alias]

- **GitHub:** [@yourusername](https://github.com/yourusername)
- **LinkedIn:** [Your Profile](https://linkedin.com/in/yourprofile)
- **Portfolio:** [Your Website](https://yourwebsite.com)

If you found this project helpful, please consider leaving a ⭐ on the repository!

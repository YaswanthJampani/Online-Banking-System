# 💳 Online Banking Management System

An end-to-end **Banking Web Application** that allows users to securely manage their bank accounts online. Built with modern web technologies like **Node.js**, **Express**, **MongoDB**, and **Vanilla JS**, this project provides functionalities like login, deposits, withdrawals, statement generation, and more.

---

## 📌 Features

- ✅ User Registration & Login  
- ✅ Session-based Authentication  
- ✅ View Account Details  
- ✅ Deposit & Withdraw Money  
- ✅ View Last 3 Transactions  
- ✅ Filter Transaction History by Date  
- ✅ Change Password & Phone Number  
- ✅ Secure Logout
- ✅ Admin Home To Manage Users
- ✅ Admin Ability To Modify and Delete Users  
- ✅ Admin Ability To Manage All Transactions

---

## 🛠️ Tech Stack

### 📦 Backend
- **Node.js**: JavaScript runtime environment for the server-side logic.
- **Express.js**: Fast and minimalist web framework for routing and middleware handling.
- **Mongoose**: ODM library for MongoDB to define schemas and interact with the database.
- **MongoDB**: NoSQL database used to store user and transaction data.

### 🌐 Frontend
- **HTML5**: Markup for all frontend pages.
- **CSS3**: Styling and layout with responsive design.
- **JavaScript**: Dynamic client-side behavior and API calls using `fetch`.

### 🛡️ Session Management
- **express-session**: Handles user session across routes using cookies.

---

## 📁 Folder Structure

```
project/
├── server.js            # Main server entry point
├── Account.js           # Mongoose schema for account
├── Transaction.js       # Mongoose schema for transactions
├── public/              # Frontend static HTML/CSS/JS
│   ├── login.html
│   ├── home.html
│   ├── deposit.html
│   ├── withdraw.html
│   ├── request.html     # Request statement by date
│   └── ...
└── README.md
```

---

## 🧑‍💻 Setup Instructions

### 1. Clone the Repository
git clone https://github.com/YaswanthJampani/Online-Banking-System.git
cd online-banking-system

### 2. Install Dependencies
npm install

### 3. Start MongoDB (locally)
Ensure MongoDB is running on mongodb://localhost:27017/project.

### 4. Start the Server
node server.js

### 5. Open the App
Navigate to http://localhost:3000

---

## 🔐 User Flows

### 🔸 Account Creation
Users register by entering their full details — PAN, Aadhar, phone, account type, etc.

### 🔸 Login
Verifies credentials and starts a session, storing all details server-side.

### 🔸 Deposit/Withdraw
Allows users to transact securely. Transaction data is stored in the `Transaction` collection with a timestamp.

### 🔸 Request Statement
Users can enter a start and end date to fetch filtered transaction history using:

---

## 📋 MongoDB Collections

### 🧾 Account
| Field             | Type   |
|-------------------|--------|
| fullname          | String |
| userid            | String |
| password          | String |
| account_number    | String |
| phone             | String |
| initial_balance   | Number |
| ... other fields  |        |

### 💸 Transaction
| Field           | Type   |
|----------------|--------|
| userId         | String |
| transactionType| String |
| amount         | Number |
| date           | Date   |

---


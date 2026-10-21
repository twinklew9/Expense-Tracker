<p align="center">
  <h1 align="center">💸 Expense Tracker — AI-Powered Personal Finance Manager</h1>
  <p align="center">
    <em>A full-stack web application to track income and expenses, manage budgets and recurring payments, and bulk-import transactions from CSV files — with Google Gemini automatically categorizing every expense.</em>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203.5-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot">
    <img src="https://img.shields.io/badge/Language-Java%2021-ED8B00?logo=openjdk&logoColor=white" alt="Java 21">
    <img src="https://img.shields.io/badge/Security-Spring%20Security-6DB33F?logo=springsecurity&logoColor=white" alt="Spring Security">
    <img src="https://img.shields.io/badge/AI-Spring%20AI%20%2B%20Gemini-4285F4?logo=googlegemini&logoColor=white" alt="Spring AI and Gemini">
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL">
    <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Build%20Tool-Gradle-02303A?logo=gradle&logoColor=white" alt="Gradle">
  </p>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Application Screens](#-application-screens)
- [How AI Categorization Works](#-how-ai-categorization-works)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Future Improvements](#-future-improvements)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🌟 Overview

**Expense Tracker** is a full-stack finance application that helps users understand where their money goes. Users can record income and expenses, organize them into categories, set budgets, manage recurring transactions, and view dashboard analytics and reports.

The headline feature is **AI-based categorization**: instead of tagging hundreds of rows by hand, a user uploads a CSV file and **Google Gemini (integrated through Spring AI)** assigns a suitable category to each expense automatically.

The project is split into two parts:

- a **Spring Boot REST API** (Java 21) that handles authentication, business logic, AI calls, email, and the **MySQL** database
- a **React single-page app** (built with Vite and styled with Tailwind CSS) that provides the user interface

---

## ✨ Key Features

### 🔐 Authentication & Account Management
- **User registration and login** secured with **Spring Security**
- **BCrypt password hashing** — plain-text passwords are never stored
- **Registration validation** with custom exceptions for duplicate emails, duplicate usernames, and invalid email formats
- **Forgot-password and reset-password flow** delivered by email
- **Email verification page** in the frontend
- Active/inactive account flag (`active_yn`) on users

### 💰 Transaction Management
- Record **income and expenses** with amount, date, and category
- View, edit, and delete transactions
- Transaction type handling (income vs expense) through a dedicated `TransactionType` model

### 🗂️ Category Management
- Create and manage **your own categories**
- Categories are linked to transactions for category-wise analysis

### 🤖 AI-Powered CSV Bulk Upload
- Upload a **CSV file** containing many transactions at once
- **Google Gemini** (via **Spring AI**) automatically assigns a category to each expense
- A **`BulkUploadResponse`** summarizes the result of each import
- Sample files included for testing (`data.csv` and `Invalid.csv`)

### 📊 Dashboard Analytics
- A dedicated **Overview dashboard** with spending and income insights
- Backed by a separate **Analytics** controller, service, and repository for aggregated queries

### 🎯 Budgets
- Set budgets and track spending against them
- Dedicated **Budgets** screen in the dashboard

### 🔁 Recurring Transactions
- Define repeating income or expenses (rent, subscriptions, salary, etc.)
- Dedicated **Recurring** screen in the dashboard

### 📑 Reports
- A **Reports** screen for reviewing your finances over time

### ✉️ Email Integration
- **Spring Mail** (Gmail SMTP) powers password-recovery emails through a dedicated `EmailService`

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  FRONTEND  (React 19 + Vite)                 │
│                                                              │
│   ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐   │
│   │   Pages     │   │ Dashboard    │   │  React Router   │   │
│   │ Login / Reg │──▶│ Overview,    │◀──│  (navigation)   │   │
│   │ Forgot pwd  │   │ Budgets, ... │   └─────────────────┘   │
│   └─────────────┘   └──────┬───────┘                         │
│                            │ Axios (REST / JSON)             │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP  (port 8082)
                             ▼
┌──────────────────────────────────────────────────────────────┐
│               BACKEND  (Spring Boot 3.5 · Java 21)           │
│                                                              │
│   ┌───────────────────────────────────────────────────────┐  │
│   │  Spring Security  (BCrypt, authentication, access)    │  │
│   └───────────────────────────┬───────────────────────────┘  │
│                               ▼                              │
│   ┌─────────────┐   ┌──────────────────┐   ┌─────────────┐   │
│   │ Controllers │──▶│     Services     │──▶│ Repositories│   │
│   │ (REST API)  │   │ Exp · Category   │   │ (JDBC / JPA)│   │
│   │             │   │ Transactions     │   └──────┬──────┘   │
│   │             │   │ Analytics        │          │          │
│   │             │   │ Finance          │          │          │
│   │             │   │ AiService        │          │          │
│   │             │   │ EmailService     │          │          │
│   └─────────────┘   └───┬──────────┬───┘          │          │
│                         │          │              │          │
└─────────────────────────┼──────────┼──────────────┼──────────┘
                          ▼          ▼              ▼
                  ┌──────────────┐ ┌──────────┐ ┌──────────┐
                  │ Google Gemini│ │  Gmail   │ │  MySQL   │
                  │ (Spring AI)  │ │  (SMTP)  │ │ Database │
                  └──────────────┘ └──────────┘ └──────────┘
```

The backend follows a classic **layered architecture**: Controller → Service → Repository. Each layer has one job, which keeps the code easy to test and extend.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | Primary language |
| **Spring Boot 3.5** | Application framework |
| **Spring Web** | REST API endpoints |
| **Spring Security** | Authentication and password hashing (BCrypt) |
| **Spring Data JPA / JdbcTemplate** | Database access |
| **Spring Mail** | Sending emails (Gmail SMTP) |
| **Spring AI (Google GenAI)** | Gemini integration for expense categorization |
| **MySQL** | Relational database |
| **Gradle** | Build tool |
| **Lombok** | Boilerplate reduction |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Dev server and build tool |
| **Tailwind CSS** | Utility-first styling |
| **React Router** | Client-side routing |
| **React Hook Form** | Form handling and validation |
| **Axios** | HTTP client for the REST API |

---

## 📁 Project Structure

```
Expense-Tracker/
│
├── expTracker-backendv2/                  # Spring Boot REST API
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew / gradlew.bat
│   └── src/
│       ├── main/
│       │   ├── java/com/sgt/expenseTracker/
│       │   │   ├── ExpenseTrackerApplication.java
│       │   │   ├── Config/
│       │   │   │   └── SecurityConfig.java        # Security rules, BCrypt encoder
│       │   │   ├── Constants/
│       │   │   │   └── Constants.java
│       │   │   ├── Controller/
│       │   │   │   ├── ExpController.java         # Users, auth, password recovery
│       │   │   │   ├── CategoryController.java
│       │   │   │   ├── TransactionController.java
│       │   │   │   ├── AnalyticsController.java   # Dashboard analytics
│       │   │   │   └── FinanceController.java     # Budgets & recurring
│       │   │   ├── Exception/
│       │   │   │   ├── EmailAlreadyExistsException.java
│       │   │   │   ├── InvalidEmailException.java
│       │   │   │   └── UserNameAlreadyExistsException.java
│       │   │   ├── Model/
│       │   │   │   ├── User.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── Transaction.java
│       │   │   │   ├── TransactionType.java
│       │   │   │   ├── Expense.java
│       │   │   │   ├── RecurringTransaction.java
│       │   │   │   ├── BudgetRequest.java
│       │   │   │   └── BulkUploadResponse.java
│       │   │   ├── Repository/
│       │   │   │   ├── ExpRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── TransactionsRepository.java
│       │   │   │   ├── AnalyticsRepository.java
│       │   │   │   └── FinanceRepository.java
│       │   │   └── Service/
│       │   │       ├── ExpService.java
│       │   │       ├── CustomUserService.java     # Loads users for Spring Security
│       │   │       ├── CategoryService.java
│       │   │       ├── TransactionsService.java
│       │   │       ├── AnalyticsService.java
│       │   │       ├── FinanceService.java
│       │   │       ├── AiService.java             # Gemini via Spring AI
│       │   │       └── EmailService.java          # Password-recovery emails
│       │   └── resources/
│       │       ├── application.properties         # Config (secrets via env vars)
│       │       └── static/
│       │           ├── data.csv                   # Sample CSV for bulk upload
│       │           └── Invalid.csv                # Sample CSV for testing bad input
│       └── test/
│           └── java/com/sgt/expenseTracker/
│               └── ExpenseTrackerApplicationTests.java
│
└── expTracker-frontendv2/                 # React single-page app
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                        # Routes
        └── Components/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ForgotPassword.jsx
            ├── ResetPassword.jsx
            ├── VerifyEmail.jsx
            ├── DashboardLayout.jsx        # Shell for all dashboard pages
            ├── SideBar.jsx
            ├── FinanceFeatures.jsx
            └── Dashboards/
                ├── Overview.jsx
                ├── Transactions.jsx
                ├── Categories.jsx
                ├── Budgets.jsx
                ├── Recurring.jsx
                └── Reports.jsx
```

---

## 🖥 Application Screens

| Screen | Description |
|---|---|
| **Home Page** | Landing page introducing the app |
| **Register** | Create an account with validation for duplicate or invalid emails and usernames |
| **Login** | Sign in to your account |
| **Forgot Password** | Request a password-reset email |
| **Reset Password** | Set a new password from the emailed request |
| **Verify Email** | Email verification page |
| **Overview** | Dashboard with income and spending analytics |
| **Transactions** | Add, view, edit, and delete income and expenses; CSV bulk upload |
| **Categories** | Create and manage your own categories |
| **Budgets** | Set and track budgets |
| **Recurring** | Manage repeating transactions |
| **Reports** | Review your finances over time |

---

## 🧠 How AI Categorization Works

1. The user uploads a **CSV file** of transactions from the Transactions screen.
2. The backend reads the file row by row and validates each entry.
3. For each expense, `AiService` sends the description to **Google Gemini** through **Spring AI** and asks it to pick the most suitable category.
4. The categorized transactions are saved to **MySQL** under the user's account.
5. The API returns a **`BulkUploadResponse`** summarizing the import.

This replaces slow manual tagging: a file with hundreds of rows can be categorized in a single upload.

> 💡 Try it with the sample files in `expTracker-backendv2/src/main/resources/static/` — `data.csv` for normal input and `Invalid.csv` for testing how bad data is handled.

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK)
- **Node.js** (LTS) and **npm**
- **MySQL 8** running locally
- **Google Gemini API key** — free from [Google AI Studio](https://aistudio.google.com/apikey)
- **Gmail account with an App Password** — create one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/twinklew9/Expense-Tracker.git
   cd Expense-Tracker/expTracker-backendv2
   ```

2. **Create the database**

   Open `src/main/resources/application.properties`, check `spring.datasource.url` for the database name, user, and port, and create that database in MySQL first.

3. **Set the environment variables** (see [Environment Variables](#-environment-variables))

   *Windows (PowerShell):*
   ```powershell
   $env:DB_PASSWORD="your_mysql_password"
   $env:GEMINI_API_KEY="your_gemini_api_key"
   $env:MAIL_PASSWORD="your_gmail_app_password"
   ```

   *macOS / Linux:*
   ```bash
   export DB_PASSWORD="your_mysql_password"
   export GEMINI_API_KEY="your_gemini_api_key"
   export MAIL_PASSWORD="your_gmail_app_password"
   ```

   > Using IntelliJ IDEA? Add these under **Run → Edit Configurations → Environment variables**, separated by semicolons.

4. **Run the backend** (in the same terminal where you set the variables)
   ```bash
   ./gradlew bootRun
   ```
   On Windows use `gradlew.bat bootRun`.

5. **Verify** — the console should end with `Started ExpenseTrackerApplication`. The server runs on **http://localhost:8082**.

### Frontend Setup

1. **Open a new terminal and move into the frontend**
   ```bash
   cd Expense-Tracker/expTracker-frontendv2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open the app** at the URL printed in the terminal (usually **http://localhost:5173**).

> Make sure the Axios base URL in the frontend points to the backend (`http://localhost:8082`).

---

## 🔑 Environment Variables

Secrets are **never stored in the code**. `application.properties` only references them:

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_PASSWORD` | Password of your MySQL user | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key used by Spring AI | ✅ Yes |
| `MAIL_PASSWORD` | Gmail **App Password** used to send emails | ✅ Yes |

---

## 🔒 Security

- **Passwords are hashed with BCrypt** before being saved — the database never holds plain-text passwords
- **Spring Security** protects the API and handles user authentication
- **No secrets in source control** — database password, API key, and mail password are read from environment variables
- **Input validation** with custom exceptions for duplicate emails, duplicate usernames, and invalid email formats

---

## 🧰 Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `Access denied for user 'root'@'localhost'` | `DB_PASSWORD` does not match your MySQL password. Check the value, and avoid `;` inside the password if you set it in IntelliJ. |
| App starts but AI categorization fails | `GEMINI_API_KEY` is missing or invalid. Create a new key in Google AI Studio. |
| Emails are not delivered | `MAIL_PASSWORD` must be a Gmail **App Password**, not your normal Gmail password. |
| Environment variables are ignored | They must be set in the **same terminal** that starts the app, or in your IDE's run configuration. |
| Frontend cannot reach the backend | Confirm the backend is running on port **8082** and that the frontend's Axios base URL matches. |

---

## 🔮 Future Improvements

- 🐳 Dockerize the backend, frontend, and database for one-command startup
- ✅ Add unit and integration tests for services and controllers
- 🔄 Set up CI with GitHub Actions
- ☁️ Deploy the app to the cloud
- 📤 Export reports and charts as downloadable files
- 💱 Multi-currency support

---

## 👥 Contributors

| Name | GitHub |
|---|---|
| **Twinkle Wadhwa** | [@twinklew9](https://github.com/twinklew9) |
| **Sujal Tejwani** | [@sujaltejwani](https://github.com/sujaltejwani) |

---

## 📄 License

This project is built for learning and portfolio purposes.

---

<p align="center">
  <strong>💸 Know where your money goes 💸</strong>
</p>

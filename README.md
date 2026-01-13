# Online Judge System

A modern, full-stack Online Judge platform built with **Go (Fiber)**, **Next.js**, **PostgreSQL**, and **Docker**.

## 🚀 Features

*   **User Authentication**: Google OAuth & JWT-based auth.
*   **Problem Management**: Create, edit, delete, and filter problems.
*   **Code Execution**: Secure, isolated code execution using **Docker-in-Docker**.
*   **Multi-language Support**: Python, C++, Java, Go, Node.js.
*   **Contests**: Create and participate in real-time coding contests with leaderboards.
*   **Admin Panel**: Moderate user-submitted problems.
*   **Responsive UI**: Modern interface built with Tailwind CSS.

## 🛠️ Tech Stack

*   **Backend**: Go (Golang), Fiber Framework, GORM.
*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Monaco Editor.
*   **Database**: PostgreSQL.
*   **Infrastructure**: Docker, Docker Compose.

## 📦 Installation & Setup

### Prerequisites

*   Docker & Docker Compose
*   Git

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/online-judge.git
    cd online-judge
    ```

2.  **Configure Environment Variables:**
    *   Create `.env` file in `backend/` (optional, defaults are set in docker-compose).
    *   Set up Google OAuth credentials if you want to use Google Login.

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application:**
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend API**: [http://localhost:8000](http://localhost:8000)
    *   **Swagger Docs**: [http://localhost:8000/swagger/index.html](http://localhost:8000/swagger/index.html)

### Default Users (Seeded)

The database is automatically seeded with dummy data on first run.

*   **Admin User**: `admin@example.com` / `password`
*   **Regular Users**: `user1@example.com` ... `user15@example.com` / `password`

## 🧪 Testing

The backend includes a self-test module that runs on startup to verify compiler functionality. Check the Docker logs for:
`✅ ВСЕ КОМПИЛЯТОРЫ РАБОТАЮТ КОРРЕКТНО`

## 📝 License

This project is open-source and available under the MIT License.

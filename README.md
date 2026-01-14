# 🍊 Orange Time

**Orange Time** is a modern, aesthetic personal task management application built with React and Vite. It features a beautiful glassmorphic UI, interactive dashboard, timeline views, and smart categorization to help you manage your time effectively.

## ✨ Key Features

- **📊 Interactive Dashboard**: Get a high-level overview of your tasks with visual statistics.
- **📅 Timeline View**: Visualize your schedule with an intuitive timeline interface.
- **🏷️ Smart Categories**: Organize tasks by categories like Personal, Learning, Health, Urgent, Design, and Product.
- **❄️ Visual Effects**: Enjoy a polished user experience with smooth animations and optional snowfall effects.
- **🌓 Modern UI**: sleek design utilizing Tailwind CSS and glassmorphism principles.
- **💾 Local Persistence**: (Currently using a local backend mock)

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express (Simple API for task management)
- **Visualization**: Recharts
- **Containerization**: Docker

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (Node Package Manager)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/hellowwwA/orange-time.git
    cd orange-time
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Running Locally

To start both the frontend and the backend server concurrently:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 🐳 Running with Docker

You can easily run the application using Docker Compose:

```bash
docker-compose up --build
```

Access the application at `http://localhost:5173`.

## 📂 Project Structure

```
orange-time/
├── components/       # React components (Dashboard, Timeline, etc.)
├── server/           # Backend server files
├── start.sh          # Startup script
├── App.tsx           # Main application component
├── index.css         # Global styles (Tailwind)
├── vite.config.ts    # Vite configuration
└── Dockerfile        # Docker configuration
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

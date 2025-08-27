# AI-Code-Reviewer

> 🚀 An AI-powered tool that reviews code across different programming languages, giving feedback, suggestions, and best practices to improve quality, performance, and maintainability.

---

## 📌 Overview

**AI-Code-Reviewer** is a full-stack project that leverages AI to automate code reviews.  
It is built with a **Frontend** (for code input and results display) and a **Backend** (for AI processing and response handling).

The goal is to make code reviews faster, smarter, and more consistent, helping developers write cleaner and more efficient code.

---

## ✨ Features

- ✅ Automated AI-powered code review  
- ✅ Feedback on readability, maintainability, and best practices  
- ✅ Multi-language support (JavaScript, Python, Java, C++, and more)  
- ✅ Modular design with separate **Frontend** and **Backend**  
- ✅ Easy environment setup and extensible for future improvements  

---

## 🗂 Project Structure
```
AI-Code-Reviewer/
├── Backend/ # Server / API logic
├── Frontend/ # Web interface
├── .env.local # Local environment variables
├── .gitignore # Ignored files
├── temp.js # Temporary test file
├── temp.md # Temporary notes
└── README.md # Project documentation (this file)
```


### 🔧 Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v14 or higher recommended)  
- npm   
- An AI API key (e.g., OpenAI or Gemini)

---

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/Abhay-0103/AI-Code-Reviewer.git
cd AI-Code-Reviewer
```

# Install backend dependencies
```
cd Backend
npm install
```

# Install frontend dependencies
```
cd ../Frontend
npm install
```

# ⚙️ Environment Setup

Copy .env.local → .env in both Backend and Frontend (if required):
```
.env.local .env
Add your API key(s) inside .env:
```

# env
```
OPENAI_API_KEY=your_api_key_here
```
# ▶️ Running the App
```
cd Backend
npm start
```
Runs the backend server (default: http://localhost:4000).

# Frontend
```
cd Frontend
npm start
```
Runs the frontend app (default: http://localhost:3000).

# 💻 Usage

Open the frontend in your browser.

Paste or type your code snippet.

Click Review.

Get instant AI-powered feedback with suggestions for improvements.

🩺 AI-Powered Diabetes Risk Predictor & Patient Portal
https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
https://img.shields.io/badge/Node.js-22.x-43853D?style=for-the-badge&logo=node.js&logoColor=white
https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white
https://img.shields.io/badge/FastAPI-0.115-005571?style=for-the-badge&logo=fastapi
https://img.shields.io/badge/MongoDB-8.0-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
https://img.shields.io/badge/scikit--learn-1.8-FF6F00?style=for-the-badge&logo=scikit-learn&logoColor=white
https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white
https://img.shields.io/badge/Electron-41.4-47848F?style=for-the-badge&logo=electron&logoColor=white
https://img.shields.io/badge/WhatsApp_Alert-25D366?style=for-the-badge&logo=whatsapp&logoColor=white
https://img.shields.io/badge/License-MIT-blue?style=for-the-badge

📖 Table of Contents
Overview

System Architecture

Technology Stack & Versions

Project Structure

Prerequisites & Installation

1. Clone the Repository

2. Python ML Microservice Setup

3. Node.js Backend Setup

4. React Frontend Setup

5. MongoDB Atlas Configuration

6. WhatsApp Bot Authentication

7. Environment Variables (.env)

How to Run the Project

How to Build the Desktop App (.exe)

Test Cases

Features

API Documentation

Troubleshooting

License

Acknowledgments

🎯 Overview
AI Health Risk Tracker is a full-stack, microservice-based medical diagnostic platform that predicts a patient's risk of developing diabetes using a Machine Learning model trained on 253,680 real patient records from the CDC's Behavioral Risk Factor Surveillance System (BRFSS).

When a high-risk score is detected (>50%), the system automatically dispatches a WhatsApp alert to the patient's phone number and logs the incident in a cloud database.

Key Innovation: Explainable AI (XAI)
Unlike typical black-box AI models, this system incorporates Logistic Regression with calibrated probability estimates, allowing medical professionals to interpret exactly which lifestyle factors (BMI, physical activity, diet, blood pressure) contributed to the risk score.

🏗️ System Architecture

```mermaid
graph TD
    subgraph "Frontend Layer"
        React[⚛️ React 19 + Vite 8]
        Electron[🖥️ Electron Desktop Wrapper]
    end

    subgraph "Backend Layer"
        Express[⚙️ Express.js 4 + Node.js 22]
        Python[🐍 FastAPI + scikit-learn 1.8]
        WhatsApp[💬 WhatsApp Web.js Bot]
        Email[📧 Nodemailer]
    end

    subgraph "Data Layer"
        MongoDB[(🍃 MongoDB Atlas)]
        CDC[(🏛️ CDC BRFSS Dataset)]
    end

    React -->|REST API| Express
    Express -->|Bridge Request| Python
    Python -->|Risk Score JSON| Express
    Express -->|Save Result| MongoDB
    Express -->|Trigger Alert| WhatsApp
    Express -->|Government Alert| Email
    Python -->|Fetched via| CDC
    
    style React fill:#61DAFB,color:#000
    style Python fill:#3776AB,color:#fff
    style MongoDB fill:#4EA94B,color:#fff

Data Flow (Request Lifecycle)
User fills health questionnaire in React UI

React sends POST /api/calculate-risk to Node.js Express server

Express forwards data to Python FastAPI at POST /predict-risk

Python runs the pre-trained Logistic Regression model and returns risk percentage

Express saves the result to MongoDB Atlas

If risk > 50%, Express triggers:

WhatsApp alert via whatsapp-web.js headless browser

Email notification via Nodemailer (optional)

Express returns final JSON to React, which renders an animated risk meter

💻 Technology Stack & Versions
Layer	Technology	Version	Purpose
Frontend	React	19.2.4	UI framework
Vite	8.0.4	Build tool & dev server
Electron	41.4.0	Desktop app wrapper
react-router-dom	7.14.1	Client-side routing
Axios	1.15.0	HTTP client
Backend	Node.js	22.x LTS	JavaScript runtime
Express	4.21	Web framework
Mongoose	8.x	MongoDB ODM
whatsapp-web.js	Latest	WhatsApp automation
Nodemailer	Latest	Email sending
dotenv	Latest	Environment variables
AI Engine	Python	3.14	ML runtime
FastAPI	0.115	API framework
Uvicorn	Latest	ASGI server
scikit-learn	1.8.0	Machine learning
pandas	3.0.2	Data manipulation
numpy	2.4.4	Numerical computing
ucimlrepo	0.0.7	Dataset fetcher
Database	MongoDB Atlas	8.0	Cloud NoSQL database
Dataset	CDC BRFSS 2015	ID: 891	253,680 patient records
Development Tools Required
VS Code (or any IDE)

Git (optional, for version control)

Postman (optional, for API testing)

Windows Terminal / PowerShell (3 separate terminals)

📁 Project Structure
text
diabities/
├── frontend/                    # React + Vite + Electron
│   ├── public/
│   │   └── app-icon.ico         # App icon for .exe
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css              # Custom risk meter & blue/white theme
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── electron.cjs             # Electron main process
│   ├── vite.config.js           # Vite configuration
│   ├── package.json             # Dependencies & build scripts
│   └── index.html               # HTML template
│
├── backend/                     # Node.js + Express
│   ├── server.js                # Main backend server
│   ├── .env                     # Environment variables (DO NOT COMMIT)
│   ├── package.json             # Dependencies
│   └── node_modules/            # Installed packages
│
├── ml_api/                      # Python + FastAPI
│   ├── main.py                  # AI model & prediction endpoint
│   ├── venv/                    # Python virtual environment
│   └── requirements.txt         # Python dependencies
│
└── README.md                    # This file!
🚀 Prerequisites & Installation
System Requirements
Operating System: Windows 10/11 (64-bit)

RAM: Minimum 8GB (16GB recommended)

Storage: 2GB free space

Internet: Required for initial dataset download & WhatsApp authentication

1. Install Core Technologies
Node.js v22.x LTS
Download and install from: https://nodejs.org/en/download

Verify installation:

powershell
node --version
# Expected: v22.x.x

npm --version
# Expected: 10.x.x
Python 3.14
Download and install from: https://www.python.org/downloads/

⚠️ During installation, check the box "Add Python to PATH"

Verify installation:

powershell
python --version
# Expected: Python 3.14.x

pip --version
# Expected: pip 25.x
MongoDB Atlas (Free Cloud Tier)
Go to https://www.mongodb.com/atlas/database

Sign up for a free account

Create a free cluster (choose "M0 Free Tier")

Create a database user with a username and password

Add your IP address to the allowlist (use "Allow Access from Anywhere" for development)

Click "Connect" → "Drivers" → Copy your connection string

Your connection string will look like:

text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
Git (Optional)
Download from: https://git-scm.com/downloads

2. Python ML Microservice Setup (Terminal 1)
powershell
# Navigate to the ML API folder
cd "C:\Users\ss v\Desktop\diabities\ml_api"

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# You should now see (venv) at the beginning of your prompt

# Install all required Python packages
pip install fastapi uvicorn scikit-learn pandas numpy ucimlrepo

# Verify installation
pip list
Expected packages installed:

text
fastapi          0.115.x
uvicorn          x.x.x
scikit-learn     1.8.0
pandas           3.0.2
numpy            2.4.4
ucimlrepo        0.0.7
3. Node.js Backend Setup (Terminal 2)
powershell
# Navigate to the backend folder
cd "C:\Users\ss v\Desktop\diabities\backend"

# Initialize the project (if not already done)
npm init -y

# Install all dependencies
npm install express mongoose whatsapp-web.js qrcode-terminal nodemailer cors dotenv

# Verify installation
npm list --depth=0
Expected packages installed:

text
express         4.21.x
mongoose        8.x.x
whatsapp-web.js x.x.x
qrcode-terminal x.x.x
nodemailer      x.x.x
cors            x.x.x
dotenv          x.x.x
4. React Frontend Setup (Terminal 3)
powershell
# Navigate to the frontend folder
cd "C:\Users\ss v\Desktop\diabities\frontend"

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
Expected packages installed:

text
react           19.2.4
react-dom       19.2.4
vite            8.0.4
axios           1.15.0
electron        41.4.0
electron-builder 26.8.1
5. MongoDB Atlas Configuration
Open backend/.env file (create it if it doesn't exist)

Add your MongoDB connection string (replace <username> and <password> with your actual credentials):

env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/health_tracker?retryWrites=true&w=majority
6. WhatsApp Bot Authentication
When you first start the Node.js server, a QR code will appear in the terminal. Scan it with WhatsApp on your phone:

Open WhatsApp on your phone

Tap the three dots (⋮) → "Linked Devices" → "Link a Device"

Scan the QR code from your terminal

Once connected, the session is saved locally (no need to scan again)

7. Environment Variables (.env)
Create a backend/.env file with the following content:

env
# MongoDB Connection
MONGO_URI=mongodb+srv://diabetes_user:your_password@cluster0.mongodb.net/health_tracker?retryWrites=true&w=majority

# Server Port
PORT=5000

# Gmail Credentials (for email alerts - optional)
# Use App Password, not your regular Gmail password!
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your16characterapppassword

# Government Email (where alerts are sent)
GOVT_EMAIL=health_alert@example.com
⚠️ Important:

Never commit your .env file to Git

For Gmail, you must enable 2-Factor Authentication and generate an "App Password" from your Google Account settings

🖥️ How to Run the Project
You need 3 separate terminal windows running simultaneously.

Terminal 1: Python ML Brain
powershell
cd "C:\Users\ss v\Desktop\diabities\ml_api"
.\venv\Scripts\activate
uvicorn main:app
Wait 30-60 seconds for the CDC dataset to download and the model to train. You should see:

text
⏳ Downloading CDC Dataset from UC Irvine...
🧠 Training the AI on over 250,000 real patients...
✅ Massive Model Training Complete! Ready for predictions.
INFO:     Uvicorn running on http://127.0.0.1:8000
Terminal 2: Node.js Backend Server
powershell
cd "C:\Users\ss v\Desktop\diabities\backend"
node server.js
You should see:

text
🚀 Node Server running on http://localhost:5000
✅ MongoDB Connected Successfully!
✅ WhatsApp Bot is Ready and Connected!
Terminal 3: React Frontend
powershell
cd "C:\Users\ss v\Desktop\diabities\frontend"
npm run dev
Open your browser and go to: http://localhost:5173

📦 How to Build the Desktop App (.exe)
Once your app is working perfectly in the browser, you can package it as a standalone Windows executable.

Step 1: Verify electron.cjs and package.json
Make sure electron.cjs exists in the frontend/ folder and package.json has the build-exe script.

Step 2: Create an App Icon (Optional but Recommended)
Place a app-icon.ico file in frontend/public/. You can generate one from any image at https://convertio.co/png-ico/.

Step 3: Build the .exe
powershell
cd "C:\Users\ss v\Desktop\diabities\frontend"
npm run build-exe
This will:

Build your React app into optimized HTML/CSS/JS (in dist/ folder)

Package everything with Electron into a Windows installer

The output will be in:

text
frontend/release/AI Health Tracker Setup 1.0.0.exe
⚠️ Remember: The .exe is just the frontend wrapper. The Python and Node.js servers must still be running on the host machine for the app to function.

🧪 Test Cases
Use these test cases to verify your system works correctly:

Test Case	Age	BMI	High BP	Exercise	Fruits	Veggies	Expected Risk	Alert?
Healthy Young	25	22.0	No	Yes	Yes	Yes	<20%	❌ No
Moderate Adult	45	28.0	No	No	No	Yes	25-40%	❌ No
High Risk Senior	80	60.0	Yes	No	No	No	>50%	✅ Yes
Extreme Case	90	120.0	Yes	No	No	No	>60%	✅ Yes
✨ Features
Core Functionality
✅ Real-time Diabetes Risk Prediction using CDC-trained ML model

✅ WhatsApp Alert System for high-risk patients (>50% threshold)

✅ MongoDB Database for patient record storage

✅ Email Notifications to healthcare authorities (configurable)

User Interface
🎨 Blue & White Medical Theme with professional aesthetics

📊 Custom Animated Risk Meter (zero dependencies)

🎯 Color-coded Risk Badge (Green/Yellow/Red)

📱 Fully Responsive Design (mobile, tablet, desktop)

🔄 Smooth Animations for a polished user experience

Technical Excellence
🏗️ Microservice Architecture (3 independent services)

🔒 Environment Variable Protection (.env configuration)

📦 Desktop App Packaging (Electron .exe build)

🌐 RESTful API Design with proper error handling

🗄️ Cloud Database (MongoDB Atlas free tier)

📡 API Documentation
Python FastAPI Endpoint
POST http://127.0.0.1:8000/predict-risk

Request Body:

json
{
  "phone": "9876543210",
  "age": 45,
  "bmi": 28.5,
  "high_bp": 1,
  "phys_activity": 0,
  "fruits": 1,
  "veggies": 0
}
Response:

json
{
  "risk_percentage": 42.35
}
Status Codes:

Code	Meaning
200	Success
422	Invalid input data
Node.js Express Endpoint
POST http://localhost:5000/api/calculate-risk

Request Body:

json
{
  "phone": "9876543210",
  "age": 45,
  "bmi": 28.5,
  "high_bp": 1,
  "phys_activity": 0,
  "fruits": 1,
  "veggies": 0
}
Response:

json
{
  "status": "success",
  "risk_percentage": 42.35,
  "alert_sent": false
}
🔧 Troubleshooting
Common Errors & Solutions
Error	Cause	Solution
ModuleNotFoundError: No module named 'ucimlrepo'	Python package not installed	Run pip install ucimlrepo in the venv
uvicorn is not recognized	Virtual environment not activated	Run .\venv\Scripts\activate first
MongoDB Connection Error	Wrong connection string or IP not whitelisted	Check .env file and MongoDB Atlas IP allowlist
422 Unprocessable Content	Old React form sending wrong field names	Make sure you're using the updated App.jsx
WhatsApp QR code not showing	whatsapp-web.js cache issue	Delete the .wwebjs_auth folder and restart
Gmail 535-5.7.8 BadCredentials	Wrong password or not using App Password	Enable 2FA and generate App Password in Google settings
react-gauge-chart errors	Outdated library incompatible with React 19	We replaced it with the custom risk meter!
Electron build fails	Missing icon or wrong config	Create public/app-icon.ico or remove the icon line
Port Already in Use
If port 5000, 5173, or 8000 is already in use:

powershell
# Find and kill process on a specific port (example: port 5000)
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
📄 License
This project is licensed under the MIT License - see below for details:

text
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
🙏 Acknowledgments
CDC BRFSS Dataset - U.S. Centers for Disease Control and Prevention

UC Irvine Machine Learning Repository - Dataset hosting and API

scikit-learn Documentation - Machine learning guidance

WhatsApp Web.js Community - WhatsApp automation library

MongoDB Atlas - Free cloud database tier

👨‍💻 Project Contributors
Name	Role	GitHub
Rishabh Tiwari	Full-Stack Developer & AI Engineer	@rishabh-022
🎓 Project Status
This project was developed as a B.Tech Major Project demonstrating proficiency in:

Full-Stack Web Development (MERN Stack)

Machine Learning & Data Science

Microservice Architecture

API Design & Integration

Cloud Database Management

Desktop Application Packaging

Automated Notification Systems
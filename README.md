# 🩺 AI-Powered Diabetes Risk Predictor & Patient Portal

![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-22.x-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-FF6F00?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-41.4-47848F?style=for-the-badge&logo=electron&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp_Alert-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 📖 Table of Contents
* Overview
* System Architecture
* Technology Stack & Versions
* Project Structure
* Prerequisites & Installation
* How to Run the Project
* How to Build the Desktop App (.exe)
* Test Cases
* Features
* API Documentation
* Troubleshooting
* License
* Acknowledgments

---

## 🎯 Overview
AI Health Risk Tracker is a full-stack, microservice-based medical diagnostic platform that predicts a patient's risk of developing diabetes using a Machine Learning model trained on 253,680 real patient records from the CDC's Behavioral Risk Factor Surveillance System (BRFSS).

When a high-risk score is detected (>50%), the system automatically dispatches a WhatsApp alert to the patient's phone number and logs the incident in a cloud database.

**Key Innovation: Explainable AI (XAI)**
Unlike typical black-box AI models, this system incorporates Logistic Regression with calibrated probability estimates, allowing medical professionals to interpret exactly which lifestyle factors (BMI, physical activity, diet, blood pressure) contributed to the risk score.

---

## 🏗️ System Architecture
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
    ```

Data Flow (Request Lifecycle)
1. User fills health questionnaire in React UI.

2. React sends POST /api/calculate-risk to Node.js Express server.

3. Express forwards data to Python FastAPI at POST /predict-risk.

4. Python runs the pre-trained Logistic Regression model and returns risk percentage.

5. Express saves the result to MongoDB Atlas.

6. If risk > 50%, Express triggers:

   a. WhatsApp alert via whatsapp-web.js headless browser.

   b. Email notification via Nodemailer (optional).

7. Express returns final JSON to React, which renders an animated risk meter.

💻 Technology Stack & Versions
Layer,Technology,Version,Purpose
Frontend,React,19.2.4,UI framework
,Vite,8.0.4,Build tool & dev server
,Electron,41.4.0,Desktop app wrapper
,react-router-dom,7.14.1,Client-side routing
,Axios,1.15.0,HTTP client
Backend,Node.js,22.x LTS,JavaScript runtime
,Express,4.21,Web framework
,Mongoose,8.x,MongoDB ODM
,whatsapp-web.js,Latest,WhatsApp automation
,Nodemailer,Latest,Email sending
,dotenv,Latest,Environment variables
AI Engine,Python,3.14,ML runtime
,FastAPI,0.115,API framework
,Uvicorn,Latest,ASGI server
,scikit-learn,1.8.0,Machine learning
,pandas,3.0.2,Data manipulation
,numpy,2.4.4,Numerical computing
,ucimlrepo,0.0.7,Dataset fetcher
Database,MongoDB Atlas,8.0,Cloud NoSQL database
Dataset,CDC BRFSS 2015,ID: 891,"253,680 patient records"

📁 Project Structure
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
* Operating System: Windows 10/11 (64-bit)

* RAM: Minimum 8GB (16GB recommended)

* Storage: 2GB free space

* Internet: Required for initial dataset download & WhatsApp authentication

1. Install Core Technologies
* Node.js v22.x LTS: Download from nodejs.org

* Python 3.14: Download from python.org (⚠️ Check the box "Add Python to PATH" during installation)

* MongoDB Atlas: Create a free cluster at mongodb.com/atlas/database

2. Python ML Microservice Setup (Terminal 1)
# Navigate to the ML API folder
cd "C:\Users\ss v\Desktop\diabities\ml_api"

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install all required Python packages
pip install fastapi uvicorn scikit-learn pandas numpy ucimlrepo

3. Node.js Backend Setup (Terminal 2)
# Navigate to the backend folder
cd "C:\Users\ss v\Desktop\diabities\backend"

# Initialize and install dependencies
npm init -y
npm install express mongoose whatsapp-web.js qrcode-terminal nodemailer cors dotenv

4. React Frontend Setup (Terminal 3)
# Navigate to the frontend folder
cd "C:\Users\ss v\Desktop\diabities\frontend"

# Install all dependencies
npm install

5. MongoDB Atlas Configuration
Open backend/.env file (create it if it doesn't exist) and add your connection string:

MONGO_URI=mongodb://admin:health_tracker_123@ac-v9doub0-shard-00-00.cxw8tvb.mongodb.net:27017,ac-v9doub0-shard-00-01.cxw8tvb.mongodb.net:27017,ac-v9doub0-shard-00-02.cxw8tvb.mongodb.net:27017/?ssl=true&replicaSet=atlas-11s4ll-shard-0&authSource=admin&appName=diabities

6. WhatsApp Bot Authentication
When you first start the Node.js server, a QR code will appear in the terminal.

a. Open WhatsApp on your phone.

b. Tap the three dots (⋮) → "Linked Devices" → "Link a Device".

c. Scan the QR code from your terminal.

7. Environment Variables (.env)
Create a backend/.env file with the following content:
# MongoDB Connection
MONGO_URI=mongodb+srv://diabetes_user:your_password@cluster0.mongodb.net/health_tracker?retryWrites=true&w=majority

# Server Port
PORT=5000

# Gmail Credentials (optional)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your16characterapppassword
GOVT_EMAIL=health_alert@example.com

⚠️ Important: Never commit your .env file to Git!

🖥️ How to Run the Project
You need 3 separate terminal windows running simultaneously.

Terminal 1: Python ML Brain
cd "C:\Users\ss v\Desktop\diabities\ml_api"
.\venv\Scripts\activate
uvicorn main:app

Terminal 2: Node.js Backend Server
cd "C:\Users\ss v\Desktop\diabities\backend"
node server.js

Terminal 3: React Frontend
cd "C:\Users\ss v\Desktop\diabities\frontend"
npm run dev

Open your browser and go to: http://localhost:5173

📦 How to Build the Desktop App (.exe)
cd "C:\Users\ss v\Desktop\diabities\frontend"
npm run build-exe

The output will be located in: frontend/release/AI Health Tracker Setup 1.0.0.exe

The output will be located in: frontend/release/AI Health Tracker Setup 1.0.0.exe

🧪 Test Cases
Test Case,Age,BMI,High BP,Exercise,Fruits,Veggies,Expected Risk,Alert?
Healthy Young,25,22.0,No,Yes,Yes,Yes,<20%,❌ No
Moderate Adult,45,28.0,No,No,No,Yes,25-40%,❌ No
High Risk Senior,80,60.0,Yes,No,No,No,>50%,✅ Yes
Extreme Case,90,120.0,Yes,No,No,No,>60%,✅ Yes

✨ Features
* ✅ Real-time Diabetes Risk Prediction using CDC-trained ML model

* ✅ WhatsApp Alert System for high-risk patients (>50% threshold)

* ✅ MongoDB Database for patient record storage

* 🎨 Blue & White Medical Theme with a Custom Animated Risk Meter

* 🏗️ Microservice Architecture (3 independent services)

* 📦 Desktop App Packaging (Electron .exe build)

📡 API Documentation
Python FastAPI Endpoint (POST /predict-risk)
Request Body:

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
{
  "risk_percentage": 42.35
}

🔧 Troubleshooting

Error,Cause,Solution
ModuleNotFoundError: No module named 'ucimlrepo',Python package missing,Run pip install ucimlrepo in the venv
uvicorn is not recognized,Venv not activated,Run .\venv\Scripts\activate first
MongoDB Connection Error,IP not whitelisted,Check .env and Atlas IP allowlist
WhatsApp QR code not showing,Cache issue,Delete .wwebjs_auth folder and restart
Electron build fails,Missing icon,Create public/app-icon.ico

Port Already in Use?
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

👨‍💻 Project Contributors
Name,Role,GitHub
Rishabh Tiwari,Full-Stack Developer & AI Engineer,@Rishabh-022

🎓 Project Status
This project was developed as a B.Tech Major Project demonstrating proficiency in Full-Stack Web Development (MERN Stack), Machine Learning, Microservice Architecture, API Integration, and Application Packaging.


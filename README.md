# 🩺 AI-Powered Health Risk Predictor & Patient Portal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A comprehensive, full-stack medical diagnostic tool utilizing a Microservice Architecture. This platform leverages CDC population data and Machine Learning to predict diabetes risk, featuring Explainable AI (XAI), real-time WhatsApp alerts, and HIPAA-inspired security protocols.

Developed as an advanced B.Tech engineering project to demonstrate the seamless integration of the MERN stack with highly optimized Data Science pipelines.

---

## 🏗️ System Architecture

This project is decoupled into three primary microservices, ensuring scalability and efficient resource management:

```mermaid
graph TD
    Client[📱 React Frontend] -->|HTTP POST / Predict| Node(⚙️ Node.js Express Backend)
    Client -->|HTTP POST / History| Node
    
    Node -->|MongoDB Driver| DB[(🍃 MongoDB Atlas)]
    Node -->|REST API Request| Brain{🧠 Python FastAPI}
    Node -->|Event Trigger| WA[💬 WhatsApp Bot]

    Brain -->|Calculates XAI Weights| Model((🤖 Logistic Regression + SMOTE))
    Model -->|Returns Risk %| Brain
    Brain -->|Sends JSON| Node
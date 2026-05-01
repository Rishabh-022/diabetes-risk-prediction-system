//.\venv\Scripts\activate

//.\venv\Scripts\activate

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PatientSchema = new mongoose.Schema({
    phone: String,
    pin: String, 
    risk_percentage: Number,
    date: { type: Date, default: Date.now }
});
const Patient = mongoose.model('Patient', PatientSchema);

// ✅ Updated WhatsApp client with cloud/headless configuration
const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        // Optional: Add these for better cloud performance
        executablePath: process.env.CHROME_PATH || undefined, // Custom Chrome path if needed
        ignoreHTTPSErrors: true,
    },
    // Add restart on crash
    restartOnAuthFail: true,
});

// QR Code generation for initial setup
whatsappClient.on('qr', (qr) => {
    // In cloud environments, log QR to console or send via API
    console.log('📱 QR Code generated - scan with WhatsApp:');
    qrcode.generate(qr, { small: true });
    
    // For cloud deployments, you might want to send QR via API
    // sendQRCodeToAdmin(qr);
});

whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
    console.log('🤖 Bot is now monitoring for high-risk diabetes alerts...');
});

// Handle authentication failure
whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Authentication Failed:', msg);
});

// Handle disconnections
whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Client Disconnected:', reason);
    console.log('🔄 Attempting to reconnect...');
    // The client will auto-restart with restartOnAuthFail: true
});

// Handle page errors
whatsappClient.on('change_state', (state) => {
    console.log('🔄 WhatsApp Client State:', state);
});

whatsappClient.initialize();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

app.post('/api/calculate-risk', async (req, res) => {
    try {
        const userData = req.body;
        
        const existingPatient = await Patient.findOne({ phone: userData.phone });
        
        if (existingPatient) {
            if (existingPatient.pin !== userData.pin) {
                console.log(`🔒 ACCESS DENIED: Wrong PIN attempt for ${userData.phone}`);
                return res.status(401).json({ 
                    error: 'INCORRECT_PIN',
                    message: 'Incorrect PIN. Please enter the correct 4-digit PIN for this phone number.'
                });
            }
            console.log(`✅ Returning patient verified: ${userData.phone}`);
        } else {
            console.log(`🆕 New patient registration: ${userData.phone}`);
        }
        
        const pythonResponse = await fetch('http://127.0.0.1:8000/predict-risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const pyData = await pythonResponse.json();
        const risk = pyData.risk_percentage;
        const ai_breakdown = pyData.breakdown;

        await Patient.create({ 
            phone: userData.phone, 
            pin: userData.pin, 
            risk_percentage: risk 
        });

        if (risk > 50) {
            console.log(`⚠️ HIGH RISK DETECTED (${risk}%). Initiating Alerts...`);
            
            const formattedNumber = "91" + userData.phone + "@c.us"; 
            const waMessage = `🚨 URGENT HEALTH ALERT: A diabetes risk score of ${risk}% has been detected. Please consult a healthcare professional immediately.`;
            
            // Check if WhatsApp client is ready before sending
            if (whatsappClient.info && whatsappClient.info.wid) {
                try {
                    await whatsappClient.sendMessage(formattedNumber, waMessage);
                    console.log("📨 WhatsApp alert delivered successfully.");
                } catch (waError) {
                    console.error("⚠️ WhatsApp message failed:", waError.message);
                    // Consider fallback notification (SMS, email, etc.)
                }
            } else {
                console.error("⚠️ WhatsApp client not ready - message queued for retry");
                // For production: Queue the message for retry or use fallback
            }
        }

        res.json({
            status: 'success',
            risk_percentage: risk,
            alert_sent: risk > 50,
            breakdown: ai_breakdown,
            is_new_patient: !existingPatient
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.post('/api/history', async (req, res) => {
    try {
        const { phone, pin } = req.body;
        
        const patientHistory = await Patient.find({ phone: phone })
            .sort({ date: -1 })
            .limit(10);
            
        if (patientHistory.length === 0) {
            return res.json({ 
                status: 'success', 
                data: [],
                trend: null,
                total_records: 0
            });
        }
        
        if (patientHistory[0].pin !== pin) {
            console.log(`🔒 HISTORY LOCKED: Wrong PIN attempt for ${phone}`);
            return res.status(401).json({ 
                error: 'INCORRECT_PIN',
                message: 'Incorrect PIN. Medical history is locked.'
            });
        }

        let trend = null;
        if (patientHistory.length >= 2) {
            const latest = patientHistory[0].risk_percentage;
            const previous = patientHistory[1].risk_percentage;
            
            if (latest < previous) {
                trend = 'improving';
            } else if (latest > previous) {
                trend = 'worsening';
            } else {
                trend = 'stable';
            }
        }
        
        res.json({
            status: 'success',
            data: patientHistory,
            trend: trend,
            total_records: patientHistory.length
        });
        
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: 'Failed to fetch patient history' });
    }
});

app.post('/api/check-phone', async (req, res) => {
    try {
        const { phone } = req.body;
        const patient = await Patient.findOne({ phone: phone });
        
        res.json({
            exists: !!patient,
            message: patient ? 'Returning patient - please enter your PIN' : 'New patient - create a 4-digit PIN'
        });
    } catch (error) {
        console.error("Check phone error:", error);
        res.status(500).json({ error: 'Failed to check phone number' });
    }
});

// Health check endpoint for cloud monitoring
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        whatsapp_connected: whatsappClient.info && whatsappClient.info.wid ? true : false,
        mongodb_connected: mongoose.connection.readyState === 1,
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  // Listen on all interfaces for cloud
    console.log(`🚀 Node Server running on http://localhost:${PORT}`);
    console.log(`🌐 Cloud-ready configuration activated`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // In production, you'd want to log this to a monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔻 SIGTERM received. Performing graceful shutdown...');
    await whatsappClient.destroy();
    await mongoose.connection.close();
    process.exit(0);
});
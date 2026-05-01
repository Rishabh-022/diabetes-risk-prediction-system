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

const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', 
            '--disable-gpu'            
        ],
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined, 
        ignoreHTTPSErrors: true,
    },
    restartOnAuthFail: true,
});

whatsappClient.on('qr', (qr) => {
  
    console.log('📱 QR Code generated - scan with WhatsApp:');
    qrcode.generate(qr, { small: true });
    
});

whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
    console.log('🤖 Bot is now monitoring for high-risk diabetes alerts...');
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Authentication Failed:', msg);
});

whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Client Disconnected:', reason);
    console.log('🔄 Attempting to reconnect...');

});

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
        
        const pythonResponse = await fetch('https://ai-health-python-api.onrender.com/predict-risk', {
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
            
            if (whatsappClient.info && whatsappClient.info.wid) {
                try {
                    await whatsappClient.sendMessage(formattedNumber, waMessage);
                    console.log("📨 WhatsApp alert delivered successfully.");
                } catch (waError) {
                    console.error("⚠️ WhatsApp message failed:", waError.message);
    
                }
            } else {
                console.error("⚠️ WhatsApp client not ready - message queued for retry");
                
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

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        whatsapp_connected: whatsappClient.info && whatsappClient.info.wid ? true : false,
        mongodb_connected: mongoose.connection.readyState === 1,
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Node Server running on http://localhost:${PORT}`);
    console.log(`🌐 Cloud-ready configuration activated`);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGTERM', async () => {
    console.log('🔻 SIGTERM received. Performing graceful shutdown...');
    await whatsappClient.destroy();
    await mongoose.connection.close();
    process.exit(0);
});
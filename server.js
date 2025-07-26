const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const AC_API_BASE = 'http://192.168.1.127:8080';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy endpoint untuk data telemetry
app.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(`${AC_API_BASE}/data`, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching telemetry data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch telemetry data',
            message: error.message,
            connected: false
        });
    }
});

// Proxy endpoint untuk start connection
app.post('/api/start', async (req, res) => {
    try {
        const response = await axios.get(`${AC_API_BASE}/start`, {
            timeout: 10000
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('❌ Error starting AC connection:', error.message);
        res.status(500).json({ 
            error: 'Failed to start AC connection',
            message: error.message 
        });
    }
});

// Proxy endpoint untuk check connection
app.get('/api/connection', async (req, res) => {
    try {
        const response = await axios.get(`${AC_API_BASE}/checkConnection`, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error checking connection:', error.message);
        res.json(false);
    }
});

// API endpoint untuk mendapatkan informasi host
app.get('/api/host-info', (req, res) => {
    res.json({
        frontendPort: PORT,
        frontendHost: `localhost:${PORT}`,
        acApiBase: AC_API_BASE,
        acApiHost: AC_API_BASE.replace('http://', '').replace('https://', ''),
        serverInfo: `Express.js Server | localhost:${PORT} → ${AC_API_BASE.replace('http://', '').replace('https://', '')}`,
        timestamp: new Date().toISOString()
    });
});

// API endpoint untuk konfigurasi lengkap
app.get('/api/config', (req, res) => {
    res.json({
        server: {
            port: PORT,
            host: 'localhost',
            fullUrl: `http://localhost:${PORT}`
        },
        acApi: {
            baseUrl: AC_API_BASE,
            host: AC_API_BASE.replace('http://', '').replace('https://', ''),
            endpoints: {
                data: `${AC_API_BASE}/data`,
                start: `${AC_API_BASE}/start`,
                connection: `${AC_API_BASE}/checkConnection`
            }
        },
        displayInfo: `Express.js Server | localhost:${PORT} → ${AC_API_BASE.replace('http://', '').replace('https://', '')}`,
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        server: 'AC Telemetry Frontend'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 AC Telemetry Frontend Server Started');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔗 Proxying AC API from: ${AC_API_BASE}`);
    console.log('⚡ Ready for real-time telemetry!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔌 Shutting down AC Telemetry Frontend Server...');
    process.exit(0);
});

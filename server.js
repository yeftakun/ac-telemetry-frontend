const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const AC_API_BASE = 'http://localhost:8080';

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

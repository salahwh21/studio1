const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// POST /api/backup - Save backup to server
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const backupData = req.body;
        if (!backupData || !backupData.orders) {
            return res.status(400).json({ error: 'Invalid backup data' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        const backupPath = path.join(__dirname, '../../backups', filename);

        // Save full JSON backup
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        // Also save "latest.json" for easier restoration
        const latestPath = path.join(__dirname, '../../backups', 'latest.json');
        fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2));

        console.log(`Backup saved to ${backupPath}`);

        res.json({
            success: true,
            message: 'Backup saved successfully to server',
            filename: filename
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Failed to save backup: ' + error.message });
    }
});

// GET /api/backup/latest - Get latest backup
router.get('/latest', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const latestPath = path.join(__dirname, '../../backups', 'latest.json');
        if (fs.existsSync(latestPath)) {
            const data = fs.readFileSync(latestPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'No backup found' });
        }
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Failed to retrieve backup' });
    }
});

module.exports = router;

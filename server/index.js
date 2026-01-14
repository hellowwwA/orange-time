import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Initialize tasks.json if it doesn't exist
const initData = async () => {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    }
};

initData();

app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading tasks:', error);
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing tasks:', error);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

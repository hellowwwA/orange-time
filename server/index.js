import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'tasks.json');
const MARKDOWN_DIR = path.join(__dirname, 'markdowns');
const IMAGES_DIR = path.join(__dirname, 'images');

// Serve static images
app.use('/api/images', express.static(IMAGES_DIR));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Initialize tasks.json if it doesn't exist
const initData = async () => {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    }

    try {
        await fs.access(MARKDOWN_DIR);
    } catch {
        await fs.mkdir(MARKDOWN_DIR, { recursive: true });
    }

    try {
        await fs.access(IMAGES_DIR);
    } catch {
        await fs.mkdir(IMAGES_DIR, { recursive: true });
    }

    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const tasks = JSON.parse(data);
        let migrated = false;

        for (const task of tasks) {
            if (task.content) {
                const mdFilePath = path.join(MARKDOWN_DIR, `${task.id}.md`);
                await fs.writeFile(mdFilePath, task.content, 'utf-8');
                task.hasContent = true;
                delete task.content;
                migrated = true;
            }
        }

        if (migrated) {
            await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
            console.log('Migrated tasks to extract markdown content.');
        }
    } catch (err) {
        console.error('Error migrating tasks:', err);
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

app.get('/api/tasks/:id/content', async (req, res) => {
    try {
        const mdFilePath = path.join(MARKDOWN_DIR, `${req.params.id}.md`);
        const data = await fs.readFile(mdFilePath, 'utf-8');
        res.type('text/plain').send(data);
    } catch (error) {
        res.send('');
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = req.body;
        for (const task of tasks) {
            if (task.content !== undefined) {
                if (task.content.trim().length > 0) {
                    const mdFilePath = path.join(MARKDOWN_DIR, `${task.id}.md`);
                    await fs.writeFile(mdFilePath, task.content, 'utf-8');
                    task.hasContent = true;
                } else {
                    task.hasContent = false;
                    const mdFilePath = path.join(MARKDOWN_DIR, `${task.id}.md`);
                    try {
                        await fs.unlink(mdFilePath);
                    } catch (e) { }
                }
                delete task.content;
            }
        }
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing tasks:', error);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    // Return the URL to access the uploaded image
    const imageUrl = `/api/images/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.originalname });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

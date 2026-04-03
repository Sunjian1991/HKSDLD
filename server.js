import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 存储文件路径
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'lol-manager-data.json');

// 确保存储目录存在
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// 确保存储文件存在
if (!fs.existsSync(STORAGE_FILE)) {
  const defaultData = {
    equipment: [],
    runes: [],
    runeCategories: [],
    heroes: [],
    heroCategories: [],
    builds: [],
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(defaultData, null, 2));
}

// 读取数据
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// 写入数据
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 处理所有其他请求，返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Storage file: ${STORAGE_FILE}`);
});

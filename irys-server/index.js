const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const idsPath = path.join(__dirname, 'ids.json');
function loadIds() {
  try {
    const data = fs.readFileSync(idsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastWorkspaceId: null, lastPagesId: null };
  }
}
function saveIds(ids) {
  fs.writeFileSync(idsPath, JSON.stringify(ids, null, 2));
}
let { lastWorkspaceId, lastPagesId } = loadIds();

// Клиент отправляет только id после upload в Irys
app.post('/workspace', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    lastWorkspaceId = id;
    saveIds({ lastWorkspaceId, lastPagesId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/workspace', async (req, res) => {
  try {
    if (!lastWorkspaceId) return res.json({});
    const response = await fetch(`https://gateway.irys.xyz/${lastWorkspaceId}`);
    if (!response.ok) throw new Error('Failed to fetch workspace from Irys');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/pages', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    lastPagesId = id;
    saveIds({ lastWorkspaceId, lastPagesId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/pages', async (req, res) => {
  try {
    if (!lastPagesId) return res.json({});
    const response = await fetch(`https://gateway.irys.xyz/${lastPagesId}`);
    if (!response.ok) throw new Error('Failed to fetch pages from Irys');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/storage-stats', async (req, res) => {
  try {
    if (!lastPagesId) return res.json({ items: 0, size: 0 });
    const response = await fetch(`https://gateway.irys.xyz/${lastPagesId}`);
    if (!response.ok) throw new Error('Failed to fetch pages from Irys');
    const pages = await response.json();
    const items = Object.keys(pages).length;
    const size = JSON.stringify(pages).length;
    res.json({ items, size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Irys Node.js server running on port ${PORT}`);
});
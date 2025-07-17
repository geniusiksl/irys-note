const express = require('express');
const cors = require('cors');
const Irys = require('@irys/sdk').default;
const { ethers } = require('ethers');
const fetch = require('node-fetch'); 
const fs = require('fs');
const path = require('path');


const IRYS_URL = 'https://testnet.irys.xyz';
const IRYS_TOKEN = 'ethereum';
const PRIVATE_KEY = '0xb6affc777b195b0360b59bed30298d88ca9b1bbd6b443183018a76b2f90519b5'; 

const app = express();
app.use(cors());
app.use(express.json());


const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');


let irys;
async function initIrys() {
  try {
    irys = new Irys({
      url: IRYS_URL,
      token: IRYS_TOKEN,
      wallet: PRIVATE_KEY, 
      rpcUrl: 'https://sepolia-rpc.irys.xyz/v1/execution-rpc',
    });
    await irys.ready();
    console.log('Irys SDK initialized (Sepolia)');
  } catch (e) {
    console.error('Irys SDK init error:', e);
  }
}
initIrys();


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


app.post('/workspace', async (req, res) => {
  try {
    if (!irys) return res.status(500).json({ error: 'Irys not initialized' });
    const workspaceData = req.body;
    console.log('POST /workspace body:', workspaceData);
    const receipt = await irys.upload(JSON.stringify(workspaceData));
    lastWorkspaceId = receipt.id;
    saveIds({ lastWorkspaceId, lastPagesId });
    res.json({ success: true, id: receipt.id, url: `https://gateway.irys.xyz/${receipt.id}` });
  } catch (err) {
    console.error('Irys upload error (workspace):', err);
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
    console.error('Irys fetch error (workspace):', err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/pages', async (req, res) => {
  try {
    if (!irys) return res.status(500).json({ error: 'Irys not initialized' });
    const pagesData = req.body;
    console.log('POST /pages body:', pagesData);
    const receipt = await irys.upload(JSON.stringify(pagesData));
    lastPagesId = receipt.id;
    saveIds({ lastWorkspaceId, lastPagesId });
    res.json({ success: true, id: receipt.id, url: `https://gateway.irys.xyz/${receipt.id}` });
  } catch (err) {
    console.error('Irys upload error (pages):', err);
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
    console.error('Irys fetch error (pages):', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить статистику (items и size)
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
    console.error('Irys fetch error (storage-stats):', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Irys Node.js server running on port ${PORT}`);
});
import Irys from "@irys/sdk";
import { ethers } from "ethers"; // v5!

function getIrysWithWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("No EVM wallet found. Please install Wallet and make it the active wallet.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new Irys({
    url: "https://node1.irys.xyz",
    token: "ethereum",
    wallet: signer
  });
}

class IrysService {
  getWalletStatus() {
    if (typeof window.ethereum !== "undefined" && window.ethereum.selectedAddress) {
      return { connected: true, address: window.ethereum.selectedAddress };
    }
    return { connected: false, address: null };
  }

  isReady() {
    return true;
  }

  async getStorageStats() {
    try {
      const response = await fetch('https://irys-note.onrender.com/storage-stats');
      if (!response.ok) throw new Error('Failed to get storage stats');
      const stats = await response.json();
      return {
        totalItems: stats.items,
        totalSize: stats.size
      };
    } catch (e) {
      return { totalItems: 0, totalSize: 0 };
    }
  }

  async connectWallet() {
    if (typeof window.ethereum === "undefined") {
      return { success: false, error: "No EVM wallet found. Please install Wallet and make it the active wallet." };
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      return { success: true, address: accounts[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async saveDataToIrys(data) {
    const irys = getIrysWithWallet();
    await irys.ready();
    const receipt = await irys.upload(JSON.stringify(data));
    return receipt.id;
  }

  async sendIdToServer(endpoint, id) {
    const res = await fetch(`https://irys-note.onrender.com/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to send id to server");
    return true;
  }

  async loadDataFromIrys(id) {
    const res = await fetch(`https://gateway.irys.xyz/${id}`);
    if (!res.ok) throw new Error("Failed to fetch data from Irys");
    return await res.json();
  }

  async loadPages() {
    try {
      const response = await fetch('https://irys-note.onrender.com/pages');
      if (!response.ok) throw new Error('Failed to load pages');
      return await response.json();
    } catch (e) {
      return {};
    }
  }

  // Добавить сохранение страницы в Irys
  async savePage(page) {
    try {
      const id = await this.saveDataToIrys(page);
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Добавить загрузку workspace (заглушка, если нет бекенда)
  async loadWorkspace() {
    try {
      const response = await fetch('https://irys-note.onrender.com/workspace');
      if (!response.ok) throw new Error('Failed to load workspace');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  disconnectWallet() {
    if (window.localStorage) {
      window.localStorage.removeItem('walletAddress');
      window.localStorage.removeItem('walletConnected');
    }
    return true;
  }
}

export const irysService = new IrysService();
export default irysService;

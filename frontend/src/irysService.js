class IrysService {
  getWalletStatus() {
    const address = localStorage.getItem('walletAddress');
    const connected = !!address;
    return {
      connected,
      address: address || null
    };
  }

  isReady() {
    return true;
  }

  async getStorageStats() {
    try {
      const response = await fetch('http://localhost:4000/storage-stats');
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

  async getStorageData() {
    // Используем /pages как источник всех страниц
    try {
      const response = await fetch('http://localhost:4000/pages');
      if (!response.ok) throw new Error('Failed to get storage data');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async loadPages() {
    try {
      const response = await fetch('http://localhost:4000/pages');
      if (!response.ok) throw new Error('Failed to load pages');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async savePages(pagesData) {
    try {
      const response = await fetch('http://localhost:4000/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagesData),
      });
      if (!response.ok) throw new Error('Failed to save pages');
      return await response.json();
    } catch (e) {
      return { success: false };
    }
  }

  async loadWorkspace() {
    try {
      const response = await fetch('http://localhost:4000/workspace');
      if (!response.ok) throw new Error('Failed to load workspace');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async saveWorkspace(workspaceData) {
    try {
      const response = await fetch('http://localhost:4000/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceData),
      });
      if (!response.ok) throw new Error('Failed to save workspace');
      return await response.json();
    } catch (e) {
      return { success: false };
    }
  }

  async connectWallet() {
    if (typeof window.okxwallet !== 'undefined' || (window.ethereum && window.ethereum.isOkxWallet)) {
      try {
        const provider = window.okxwallet || window.ethereum;
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        localStorage.setItem('walletAddress', accounts[0]);
        localStorage.setItem('walletConnected', 'true');
        return {
          success: true,
          connected: true,
          address: accounts[0]
        };
      } catch (err) {
        return {
          success: false,
          connected: false,
          address: null,
          error: err.message
        };
      }
    } else {
      return {
        success: false,
        connected: false,
        address: null,
        error: 'OKX Wallet extension not found'
      };
    }
  }

  async disconnectWallet() {
    localStorage.removeItem('wallet');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
    return true;
  }

  // savePage вызывает savePages для одной страницы
  async savePage(pageData) {
    let pages = {};
    try {
      pages = await this.loadPages();
    } catch (e) {}
    pages = pages && typeof pages === 'object' ? pages : {};
    pages[pageData.id] = pageData;
    return this.savePages(pages);
  }
}

export const irysService = new IrysService();
export default irysService;
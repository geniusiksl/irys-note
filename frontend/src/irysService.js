import { ethers } from 'ethers';

// Browser-compatible IrysSDK Service for decentralized data storage
class IrysService {
  constructor() {
    this.initialized = false;
    this.storageKey = 'notion-irys-data';
    this.walletConnected = false;
    this.walletAddress = null;
    this.provider = null;
    this.signer = null;
    this.init();
  }

  // Initialize the service
  async init() {
    try {
      // Initialize localStorage if it doesn't exist
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify({
          pages: {},
          workspace: null,
          uploads: {},
          projects: {}
        }));
      }
      
      this.initialized = true;
      console.log('IrysSDK: Browser-compatible service initialized');
      return true;
    } catch (error) {
      console.error('IrysSDK: Failed to initialize:', error);
      this.initialized = false;
      return false;
    }
  }

  // Connect wallet for Irys storage
  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        this.signer = await this.provider.getSigner();
        this.walletAddress = await this.signer.getAddress();
        this.walletConnected = true;
        
        console.log('IrysSDK: Wallet connected:', this.walletAddress);
        return {
          success: true,
          address: this.walletAddress
        };
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error) {
      console.error('IrysSDK: Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.walletConnected = false;
    this.walletAddress = null;
    this.provider = null;
    this.signer = null;
    console.log('IrysSDK: Wallet disconnected');
  }

  // Get wallet connection status
  getWalletStatus() {
    return {
      connected: this.walletConnected,
      address: this.walletAddress
    };
  }

  // Get data from localStorage
  getStorageData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { pages: {}, workspace: null, uploads: {}, projects: {} };
    } catch (error) {
      console.error('IrysSDK: Failed to get storage data:', error);
      return { pages: {}, workspace: null, uploads: {}, projects: {} };
    }
  }

  // Save data to localStorage
  setStorageData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('IrysSDK: Failed to save storage data:', error);
      return false;
    }
  }

  // Upload data to mock Irys network
  async uploadData(data) {
    if (!this.initialized) {
      console.warn('IrysSDK: Not initialized. Initializing now...');
      await this.init();
    }

    try {
      const mockId = 'irys_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const result = {
        id: mockId,
        url: `https://gateway.irys.xyz/${mockId}`,
        timestamp: Date.now(),
        data: data,
        walletAddress: this.walletAddress,
        isDecentralized: this.walletConnected
      };
      
      // Store in localStorage
      const storageData = this.getStorageData();
      storageData.uploads[mockId] = result;
      this.setStorageData(storageData);
      
      console.log('IrysSDK: Mock upload successful:', result);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, this.walletConnected ? 1000 : 200));
      
      return result;
    } catch (error) {
      console.error('IrysSDK: Upload failed:', error);
      throw error;
    }
  }

  // Retrieve data from mock Irys network
  async retrieveData(id) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const storageData = this.getStorageData();
      const upload = storageData.uploads[id];
      
      if (upload) {
        console.log('IrysSDK: Data retrieved successfully:', id);
        return upload.data;
      } else {
        console.warn('IrysSDK: Data not found for id:', id);
        return null;
      }
    } catch (error) {
      console.error('IrysSDK: Retrieval failed:', error);
      return null;
    }
  }

  // Save project data
  async saveProject(projectData) {
    try {
      const result = await this.uploadData({
        type: 'project',
        data: projectData,
        version: '1.0'
      });
      
      // Also store in dedicated projects storage
      const storageData = this.getStorageData();
      storageData.projects[projectData.id] = {
        uploadId: result.id,
        data: projectData,
        lastSaved: result.timestamp
      };
      this.setStorageData(storageData);
      
      return result;
    } catch (error) {
      console.error('IrysSDK: Failed to save project:', error);
      throw error;
    }
  }

  // Load project data
  async loadProject(projectId) {
    try {
      const storageData = this.getStorageData();
      const projectInfo = storageData.projects[projectId];
      
      if (projectInfo) {
        console.log('IrysSDK: Project loaded from storage:', projectId);
        return projectInfo.data;
      } else {
        console.warn('IrysSDK: Project not found in storage:', projectId);
        return null;
      }
    } catch (error) {
      console.error('IrysSDK: Failed to load project:', error);
      return null;
    }
  }

  // Get all projects
  async getAllProjects() {
    try {
      const storageData = this.getStorageData();
      const projects = Object.values(storageData.projects).map(project => project.data);
      return projects;
    } catch (error) {
      console.error('IrysSDK: Failed to get all projects:', error);
      return [];
    }
  }

  // Upload page data
  async savePage(pageData) {
    try {
      const result = await this.uploadData({
        type: 'page',
        data: pageData,
        version: '1.0'
      });
      
      // Also store in dedicated pages storage
      const storageData = this.getStorageData();
      storageData.pages[pageData.id] = {
        uploadId: result.id,
        data: pageData,
        lastSaved: result.timestamp
      };
      this.setStorageData(storageData);
      
      return result;
    } catch (error) {
      console.error('IrysSDK: Failed to save page:', error);
      throw error;
    }
  }

  // Upload workspace data
  async saveWorkspace(workspaceData) {
    try {
      const result = await this.uploadData({
        type: 'workspace',
        data: workspaceData,
        version: '1.0'
      });
      
      // Also store in dedicated workspace storage
      const storageData = this.getStorageData();
      storageData.workspace = {
        uploadId: result.id,
        data: workspaceData,
        lastSaved: result.timestamp
      };
      this.setStorageData(storageData);
      
      return result;
    } catch (error) {
      console.error('IrysSDK: Failed to save workspace:', error);
      throw error;
    }
  }

  // Retrieve page data
  async loadPage(pageId) {
    try {
      const storageData = this.getStorageData();
      const pageInfo = storageData.pages[pageId];
      
      if (pageInfo) {
        console.log('IrysSDK: Page loaded from storage:', pageId);
        return pageInfo.data;
      } else {
        console.warn('IrysSDK: Page not found in storage:', pageId);
        return null;
      }
    } catch (error) {
      console.error('IrysSDK: Failed to load page:', error);
      return null;
    }
  }

  // Retrieve workspace data
  async loadWorkspace(workspaceId) {
    try {
      const storageData = this.getStorageData();
      const workspaceInfo = storageData.workspace;
      
      if (workspaceInfo) {
        console.log('IrysSDK: Workspace loaded from storage');
        return workspaceInfo.data;
      } else {
        console.warn('IrysSDK: Workspace not found in storage');
        return null;
      }
    } catch (error) {
      console.error('IrysSDK: Failed to load workspace:', error);
      return null;
    }
  }

  // Batch upload multiple items
  async batchUpload(items) {
    const results = [];
    for (const item of items) {
      try {
        const result = await this.uploadData(item);
        results.push(result);
      } catch (error) {
        console.error('IrysSDK: Failed to upload item in batch:', error);
        results.push({ error: error.message });
      }
    }
    return results;
  }

  // Check if service is ready
  isReady() {
    return this.initialized;
  }

  // Get storage stats
  async getStorageStats() {
    const storageData = this.getStorageData();
    const uploadCount = Object.keys(storageData.uploads).length;
    const pageCount = Object.keys(storageData.pages).length;
    const projectCount = Object.keys(storageData.projects).length;
    
    // Calculate approximate storage size
    const dataSize = new Blob([JSON.stringify(storageData)]).size;
    const sizeInKB = Math.round(dataSize / 1024);
    
    return {
      totalItems: uploadCount,
      totalPages: pageCount,
      totalProjects: projectCount,
      totalSize: sizeInKB > 1024 ? `${Math.round(sizeInKB / 1024)}MB` : `${sizeInKB}KB`,
      lastSync: Date.now(),
      isDecentralized: this.walletConnected
    };
  }

  // Clear all data (for testing)
  async clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      await this.init();
      console.log('IrysSDK: All data cleared');
      return true;
    } catch (error) {
      console.error('IrysSDK: Failed to clear data:', error);
      return false;
    }
  }

  // Export data (for backup)
  async exportData() {
    const storageData = this.getStorageData();
    return {
      ...storageData,
      exportDate: new Date().toISOString(),
      version: '1.0',
      walletAddress: this.walletAddress
    };
  }

  // Import data (for restore)
  async importData(importData) {
    try {
      if (importData.version === '1.0') {
        const { exportDate, version, walletAddress, ...data } = importData;
        this.setStorageData(data);
        console.log('IrysSDK: Data imported successfully');
        return true;
      } else {
        console.error('IrysSDK: Unsupported import version');
        return false;
      }
    } catch (error) {
      console.error('IrysSDK: Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const irysService = new IrysService();

// Auto-initialize
irysService.init().then(() => {
  console.log('IrysSDK: Browser-compatible service ready for use');
});

export default irysService;
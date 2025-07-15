import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";

// IrysSDK Service for decentralized data storage
class IrysService {
  constructor() {
    this.uploader = null;
    this.initialized = false;
  }

  // Initialize the Irys uploader
  async initialize(privateKey = null) {
    try {
      // For demo purposes, we'll use a mock implementation
      // In production, you would need actual Ethereum private key
      if (!privateKey) {
        console.warn('IrysSDK: No private key provided. Using mock storage.');
        this.initialized = true;
        return true;
      }

      this.uploader = await Uploader(Ethereum).withWallet(privateKey);
      this.initialized = true;
      console.log('IrysSDK: Successfully initialized');
      return true;
    } catch (error) {
      console.error('IrysSDK: Failed to initialize:', error);
      this.initialized = false;
      return false;
    }
  }

  // Upload data to Irys network
  async uploadData(data) {
    if (!this.initialized) {
      console.warn('IrysSDK: Not initialized. Storing data locally.');
      return this.mockUpload(data);
    }

    try {
      const dataToUpload = JSON.stringify(data);
      const receipt = await this.uploader.upload(dataToUpload);
      
      console.log(`IrysSDK: Data uploaded to ${receipt.id}`);
      return {
        id: receipt.id,
        url: `https://gateway.irys.xyz/${receipt.id}`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('IrysSDK: Upload failed:', error);
      return this.mockUpload(data);
    }
  }

  // Mock upload for demo purposes
  mockUpload(data) {
    const mockId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const result = {
      id: mockId,
      url: `https://gateway.irys.xyz/${mockId}`,
      timestamp: Date.now()
    };
    
    // Store in localStorage for demo
    localStorage.setItem(`irys_${mockId}`, JSON.stringify(data));
    console.log('IrysSDK: Mock upload successful:', result);
    return result;
  }

  // Retrieve data from Irys network
  async retrieveData(id) {
    if (!this.initialized || id.startsWith('mock_')) {
      // Retrieve from localStorage for mock data
      const data = localStorage.getItem(`irys_${id}`);
      return data ? JSON.parse(data) : null;
    }

    try {
      const response = await fetch(`https://gateway.irys.xyz/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('IrysSDK: Retrieval failed:', error);
      return null;
    }
  }

  // Upload page data
  async savePage(pageData) {
    const result = await this.uploadData({
      type: 'page',
      data: pageData,
      version: '1.0'
    });
    return result;
  }

  // Upload workspace data
  async saveWorkspace(workspaceData) {
    const result = await this.uploadData({
      type: 'workspace',
      data: workspaceData,
      version: '1.0'
    });
    return result;
  }

  // Retrieve page data
  async loadPage(pageId) {
    const data = await this.retrieveData(pageId);
    return data?.type === 'page' ? data.data : null;
  }

  // Retrieve workspace data
  async loadWorkspace(workspaceId) {
    const data = await this.retrieveData(workspaceId);
    return data?.type === 'workspace' ? data.data : null;
  }

  // Batch upload multiple items
  async batchUpload(items) {
    const results = [];
    for (const item of items) {
      const result = await this.uploadData(item);
      results.push(result);
    }
    return results;
  }

  // Check if service is ready
  isReady() {
    return this.initialized;
  }

  // Get storage stats (mock implementation)
  async getStorageStats() {
    return {
      totalItems: Object.keys(localStorage).filter(key => key.startsWith('irys_')).length,
      totalSize: '0 MB', // Mock value
      lastSync: Date.now()
    };
  }
}

// Export singleton instance
export const irysService = new IrysService();

// Auto-initialize with mock setup
irysService.initialize().then(() => {
  console.log('IrysSDK: Service ready for use');
});

export default irysService;
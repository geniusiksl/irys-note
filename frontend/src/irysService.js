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
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 минут
    this.batchSize = 10; // Размер батча для загрузки
    this.graphqlUnavailable = false;
    this.lastGraphQLCheck = 0;
    this.persistentStorageKey = 'irysNote_persistentData';
    
    // Загружаем данные из localStorage при инициализации
    this.loadPersistentData();
  }

  // Сохранение данных в localStorage для долгосрочного хранения
  savePersistentData() {
    try {
      const walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) return;
      
      const persistentData = JSON.parse(localStorage.getItem(this.persistentStorageKey) || '{}');
      
      // Сохраняем кэш для текущего кошелька
      const walletData = {};
      for (const [key, value] of this.cache.entries()) {
        if (key.includes(walletAddress)) {
          walletData[key] = value;
        }
      }
      
      persistentData[walletAddress] = {
        cache: walletData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.persistentStorageKey, JSON.stringify(persistentData));
    } catch (e) {
      console.warn('Failed to save persistent data:', e);
    }
  }

  // Загрузка данных из localStorage
  loadPersistentData() {
    try {
      const walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) return;
      
      const persistentData = JSON.parse(localStorage.getItem(this.persistentStorageKey) || '{}');
      const walletData = persistentData[walletAddress];
      
      if (walletData && walletData.cache) {
        // Проверяем, не устарели ли данные (максимум 24 часа)
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - walletData.timestamp < maxAge) {
          // Восстанавливаем кэш
          for (const [key, value] of Object.entries(walletData.cache)) {
            this.cache.set(key, value);
          }
          console.log(`Loaded persistent data for wallet ${walletAddress}`);
        }
      }
    } catch (e) {
      console.warn('Failed to load persistent data:', e);
    }
  }

  getWalletStatus() {
    // Проверяем и MetaMask, и localStorage
    const isMetaMaskConnected = typeof window.ethereum !== "undefined" && window.ethereum.selectedAddress;
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (isMetaMaskConnected) {
      // Если MetaMask подключен, обновляем localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', window.ethereum.selectedAddress);
      return { connected: true, address: window.ethereum.selectedAddress };
    } else if (wasConnected && savedAddress) {
      // Если был подключен ранее, но MetaMask недоступен
      return { connected: true, address: savedAddress, needsReconnect: true };
    }
    
    return { connected: false, address: null };
  }

  // Кэширование для недавних транзакций
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Автоматически сохраняем в localStorage
    this.savePersistentData();
  }

  // Сохранение недавних транзакций в localStorage
  saveRecentTransaction(txId, dataType) {
    try {
      const recent = JSON.parse(localStorage.getItem('recentTransactions') || '[]');
      const newTx = {
        id: txId,
        type: dataType,
        timestamp: Date.now(),
        wallet: window.ethereum.selectedAddress
      };
      
      // Добавляем в начало и ограничиваем до 50 записей
      recent.unshift(newTx);
      const limited = recent.slice(0, 50);
      
      localStorage.setItem('recentTransactions', JSON.stringify(limited));
    } catch (e) {
      console.warn('Failed to save recent transaction:', e);
    }
  }

  // Получение недавних транзакций из localStorage
  getRecentTransactions(walletAddress, dataType = null) {
    try {
      const recent = JSON.parse(localStorage.getItem('recentTransactions') || '[]');
      return recent.filter(tx => {
        const matchWallet = tx.wallet === walletAddress;
        const matchType = !dataType || tx.type === dataType;
        const notExpired = Date.now() - tx.timestamp < this.cacheTimeout;
        return matchWallet && matchType && notExpired;
      });
    } catch (e) {
      return [];
    }
  }

  isReady() {
    return true;
  }

  async getStorageStats() {
    try {
      console.log('Getting storage stats...');
      // Используем только кэшированные данные для статистики (быстро)
      const allData = await this.loadDataByWallet(null, true); // только recent данные
      
      if (!allData || allData.length === 0) {
        console.log('No data found for storage stats');
        return { 
          totalItems: 0, 
          totalSize: 0, 
          byType: {},
          status: 'no_data'
        };
      }
      
      const totalItems = allData.length;
      const totalSize = allData.reduce((sum, item) => {
        try {
          return sum + JSON.stringify(item.data || {}).length;
        } catch (e) {
          console.warn('Error calculating size for item:', item.id);
          return sum;
        }
      }, 0);
      
      // Группируем по типам
      const byType = {};
      allData.forEach(item => {
        try {
          const type = item.tags?.type || 'unknown';
          if (!byType[type]) {
            byType[type] = { count: 0, size: 0 };
          }
          byType[type].count++;
          byType[type].size += JSON.stringify(item.data || {}).length;
        } catch (e) {
          console.warn('Error processing item for stats:', item.id);
        }
      });
      
      const stats = {
        totalItems,
        totalSize,
        byType,
        oldestTimestamp: allData.length > 0 ? allData[allData.length - 1]?.timestamp : null,
        newestTimestamp: allData.length > 0 ? allData[0]?.timestamp : null,
        status: 'success'
      };
      
      console.log('Storage stats:', stats);
      return stats;
      
    } catch (e) {
      console.error('Error getting storage stats:', e);
      return { 
        totalItems: 0, 
        totalSize: 0, 
        byType: {},
        status: 'error',
        error: e.message
      };
    }
  }

  async connectWallet() {
    if (typeof window.ethereum === "undefined") {
      return { success: false, error: "No EVM wallet found. Please install Wallet and make it the active wallet." };
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Сохраняем статус подключения
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', accounts[0]);
      
      // Загружаем персистентные данные для этого кошелька
      this.loadPersistentData();
      
      return { success: true, address: accounts[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async saveDataToIrys(data, dataType = 'general', walletAddress, additionalTags = []) {
    try {
      console.log('🔗 Connecting to Irys...');
      const irys = getIrysWithWallet();
      await irys.ready();
      
      console.log('✅ Irys connection established:', {
        address: irys.address,
        token: irys.token,
        api: irys.api
      });

      if (!walletAddress) {
        walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }
      }
    
      // Валидация данных
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
    
      const tags = [
        { name: "wallet", value: walletAddress },
        { name: "app", value: "IrysNote" },
        { name: "app-id", value: "irys-notebook" },
        { name: "type", value: dataType },
        { name: "timestamp", value: Date.now().toString() },
        { name: "version", value: "2.0" },
        { name: "content-type", value: "application/json" },
        ...additionalTags
      ];
      
      console.log('📤 Uploading to Irys with tags:', tags.map(tag => `${tag.name}=${tag.value}`).join(', '));
      
      const receipt = await irys.upload(JSON.stringify(data), { tags });
      
      console.log(`✅ Data successfully saved to Irys:`, {
        transactionId: receipt.id,
        dataType: dataType,
        wallet: walletAddress,
        dataSize: JSON.stringify(data).length,
        irysUrl: `https://gateway.irys.xyz/${receipt.id}`
      });
      
      // Сохраняем в кэш и localStorage для быстрого доступа
      this.saveRecentTransaction(receipt.id, dataType);
      this.setCachedData(receipt.id, data);
      
      return receipt.id;
    } catch (error) {
      console.error('❌ Failed to save data to Irys:', error);
      throw error;
    }
  }

  async sendIdToServer(endpoint, id) {
    console.warn('sendIdToServer is deprecated - using tags for data discovery');
    return true;
  }

  async loadDataFromIrys(id) {
    // Проверяем кэш
    const cached = this.getCachedData(id);
    if (cached) {
      console.log(`📋 Loading data from cache for ${id}`);
      return cached;
    }
    
    // Пробуем загрузить из Irys gateway
    const gateways = [
      `https://gateway.irys.xyz/${id}`,
      `https://arweave.net/${id}`,
      `https://arweave.dev/${id}`
    ];
    
    for (const gateway of gateways) {
      try {
        console.log(`🔄 Trying to load data from: ${gateway}`);
        const res = await fetch(gateway);
        
        if (!res.ok) {
          console.warn(`❌ Failed to fetch from ${gateway}: ${res.status} ${res.statusText}`);
          continue;
        }
        
        let data;
        try {
          data = await res.json();
        } catch (e) {
          console.warn(`❌ Invalid JSON from ${gateway}:`, e.message);
          continue;
        }
        
        // Валидация структуры данных
        if (!data || typeof data !== 'object') {
          console.warn(`❌ Invalid data structure from ${gateway}`);
          continue;
        }
        
        console.log(`✅ Successfully loaded data from ${gateway}`);
        
        // Кэшируем результат
        this.setCachedData(id, data);
        
        return data;
      } catch (error) {
        console.warn(`❌ Error loading from ${gateway}:`, error.message);
        continue;
      }
    }
    
    throw new Error(`Failed to load data from any gateway for transaction ${id}`);
  }

  // Батчевая загрузка данных
  async loadDataBatch(ids) {
    const results = [];
    
    for (let i = 0; i < ids.length; i += this.batchSize) {
      const batch = ids.slice(i, i + this.batchSize);
      const batchPromises = batch.map(async (id) => {
        try {
          const data = await this.loadDataFromIrys(id);
          return { id, data, success: true };
        } catch (e) {
          console.warn(`Failed to load data for ${id}:`, e.message);
          return { id, data: null, success: false, error: e.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Небольшая задержка между батчами для снижения нагрузки
      if (i + this.batchSize < ids.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // Проверка доступности GraphQL endpoints (НЕ блокчейна в целом)
  shouldSkipGraphQLQuery() {
    const now = Date.now();
    
    // Если GraphQL endpoints недоступны и прошло меньше 2 минут
    if (this.graphqlUnavailable && (now - this.lastGraphQLCheck) < (2 * 60 * 1000)) {
      return true;
    }
    
    return false;
  }

  // Отметка о недоступности GraphQL endpoints
  markGraphQLUnavailable() {
    this.graphqlUnavailable = true;
    this.lastGraphQLCheck = Date.now();
    console.warn('GraphQL endpoints marked as unavailable for 2 minutes (saving still works)');
  }

  // Отметка о доступности GraphQL endpoints
  markGraphQLAvailable() {
    this.graphqlUnavailable = false;
    this.lastGraphQLCheck = 0;
    console.log('GraphQL endpoints marked as available');
  }

  // Получение всех транзакций с пагинацией и fallback механизмами
  async getAllTransactionsByWallet(walletAddress, dataType = null) {
    // Быстрая проверка - если GraphQL endpoints недоступны
    if (this.shouldSkipGraphQLQuery()) {
      console.log('Skipping GraphQL query - endpoints marked as unavailable');
      return [];
    }

    const allTransactions = [];
    let cursor = null;
    let hasNextPage = true;
    let retryCount = 0;
    const maxRetries = 2; // Увеличили до 2 попыток
    
    const tagFilters = [
      { name: "wallet", values: [walletAddress] },
      { name: "app", values: ["IrysNote"] }
      // Убираем жесткий фильтр по app-id для лучшей совместимости
    ];
    
    if (dataType) {
      tagFilters.push({ name: "type", values: [dataType] });
    }
    
    // Используем только Irys GraphQL endpoint - быстрый и надежный
    const endpoint = 'https://uploader.irys.xyz/graphql';
    const endpointName = 'Irys';
    
    while (hasNextPage && retryCount < maxRetries) {
      try {
        // Irys GraphQL запрос
        const query = `
          {
            transactions(owners: ["${walletAddress}"], limit: 100) {
              edges {
                node {
                  id
                  address
                  tags {
                    name
                    value
                  }
                }
              }
            }
          }
        `;
          
          console.log(`🔍 Querying ${endpointName}:`, query.replace(/\s+/g, ' ').trim());
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Irys GraphQL failed: ${response.status} ${response.statusText}`);
        }
          
          const result = await response.json();
        
        // Проверяем на ошибки GraphQL
        if (result.errors && result.errors.length > 0) {
          console.warn(`GraphQL errors from Irys:`, result.errors);
          throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
        }
        
        const data = result.data;
        if (!data || !data.transactions) {
          console.warn(`No transaction data from Irys`);
          break; // Выходим из цикла, так как нет данных
        }
        
        console.log(`✅ Irys query successful: found ${data.transactions?.edges?.length || 0} transactions`);
        
        const transactions = data.transactions.edges || [];
          
          // Логируем найденные транзакции
        if (transactions.length > 0) {
          console.log(`📋 Found ${transactions.length} transactions from wallet ${walletAddress}:`);
          transactions.forEach((tx, index) => {
            const node = tx.node;
            const tags = node.tags || [];
            console.log(`  ${index + 1}. ID: ${node.id}`);
            console.log(`     Tags:`, tags.map(tag => `${tag.name}="${tag.value}"`).join(', '));
          });
        } else {
          console.log(`ℹ️ No transactions found from wallet ${walletAddress} in Irys`);
          console.log(`💡 This is normal if you haven't saved any data yet`);
        }
        
        allTransactions.push(...transactions);
        
        // Irys не поддерживает пагинацию в том же формате, что Arweave
        hasNextPage = false; // Пока отключаем пагинацию для простоты
        
        break; // Выходим из цикла
        
      } catch (error) {
        console.warn(`❌ Error with Irys GraphQL:`, error.message);
        this.markGraphQLUnavailable();
        break; // Выходим из цикла при ошибке
      }
      
      if (!success) {
        if (!success) {
          console.warn('All endpoints failed, retry', `${retryCount + 1}/${maxRetries}`);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.warn('GraphQL queries completed, but may have found no matching transactions');
            console.log('This is normal if you haven\'t saved any data to Irys yet');
            // НЕ помечаем блокчейн как недоступный, если просто нет данных
            break;
          }
          
          // Небольшая задержка перед повтором
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.error('GraphQL endpoint failed, marking blockchain as unavailable');
          this.markBlockchainUnavailable();
          break;
        }
      }
      
      // Защита от бесконечного цикла (уменьшили лимит)
      if (allTransactions.length > 1000) {
        console.warn('Reached maximum transaction limit (1000)');
        break;
      }
    }
    
    console.log(`Found ${allTransactions.length} blockchain transactions`);
    
    // Если не найдено транзакций, выводим диагностическую информацию
    if (allTransactions.length === 0) {
      console.log(`🔄 No tagged transactions found for wallet ${walletAddress}`);
      console.log(`💡 Possible reasons for missing transactions:`);
      console.log(`   - Transactions not yet indexed (may take 5-15 minutes)`);
      console.log(`   - Transactions saved with different tags`);
      console.log(`   - Check wallet address correctness`);
      console.log(`   - Transaction might have been sent to different network`);
    }
    
    return allTransactions;
  }

  async loadDataByWallet(dataType = null, includeRecent = true, forceRefresh = false) {
    try {
      let walletAddress = window.ethereum?.selectedAddress;
      
      // Если MetaMask недоступен, пробуем взять из localStorage
      if (!walletAddress) {
        walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          console.warn('No wallet address available, returning empty results');
          return [];
        }
      }
      
      // Проверяем кэш для этого запроса (только если не принудительное обновление)
      const cacheKey = `wallet_${walletAddress}_${dataType || 'all'}`;
      if (!forceRefresh) {
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          console.log('Returning cached data for', cacheKey);
          return cached;
        }
      } else {
        console.log('Force refresh - skipping cache for', cacheKey);
      }
      
      const results = [];
      
      // 1. Добавляем недавние транзакции из localStorage (мгновенный доступ)
      if (includeRecent) {
        const recentTxs = this.getRecentTransactions(walletAddress, dataType);
        console.log(`Found ${recentTxs.length} recent transactions`);
        
        for (const tx of recentTxs) {
          const cachedData = this.getCachedData(tx.id);
          if (cachedData) {
            results.push({
              id: tx.id,
              data: cachedData,
              tags: {
                wallet: walletAddress,
                app: 'IrysNote',
                'app-id': 'irys-notebook',
                type: tx.type,
                timestamp: tx.timestamp.toString()
              },
              timestamp: tx.timestamp,
              isRecent: true
            });
          }
        }
      }
      
      // 2. Пытаемся получить транзакции из блокчейна (только если доступен)
      let allTransactions = [];
      
      if (!this.shouldSkipGraphQLQuery()) {
        try {
          console.log('Fetching transactions from blockchain...');
          allTransactions = await this.getAllTransactionsByWallet(walletAddress, dataType);
          console.log(`Found ${allTransactions.length} blockchain transactions`);
          
          // Если успешно получили данные, отмечаем GraphQL как доступный
          if (allTransactions.length > 0) {
            this.markGraphQLAvailable();
          }
        } catch (e) {
          console.warn('GraphQL unavailable, using cached/recent data only:', e.message);
          this.markGraphQLUnavailable();
        }
      } else {
        console.log('Skipping blockchain fetch - using cached data only');
        
        // Если есть недавние данные, возвращаем их
        if (results.length > 0) {
          console.log(`Returning ${results.length} recent transactions`);
          this.setCachedData(cacheKey, results);
          return results;
        }
        
        // Пытаемся найти любые кэшированные данные для этого кошелька
        const fallbackResults = [];
        for (const [key, value] of this.cache.entries()) {
          if (key.includes(walletAddress) && key.includes('wallet_')) {
            if (Array.isArray(value.data)) {
              fallbackResults.push(...value.data);
            }
          }
        }
        
        if (fallbackResults.length > 0) {
          console.log(`Found ${fallbackResults.length} cached transactions`);
          return fallbackResults;
        }
        
        console.log('No cached data available');
        return [];
      }
      
      // Если нет транзакций из блокчейна, возвращаем только недавние
      if (allTransactions.length === 0) {
        console.log('No blockchain transactions found, returning recent data only');
        this.setCachedData(cacheKey, results);
        return results;
      }
      
      // 3. Извлекаем ID для батчевой загрузки
      const txIds = allTransactions.map(edge => edge.node.id);
      
      // 4. Батчевая загрузка данных с обработкой ошибок
      let batchResults = [];
      try {
        console.log(`Loading data for ${txIds.length} transactions...`);
        batchResults = await this.loadDataBatch(txIds);
      } catch (e) {
        console.warn('Batch loading failed:', e.message);
        // Возвращаем недавние данные, если батчевая загрузка не удалась
        this.setCachedData(cacheKey, results);
        return results;
      }
      
      // 5. Объединяем результаты
      const blockchainResults = [];
      for (let i = 0; i < allTransactions.length; i++) {
        const edge = allTransactions[i];
        const batchResult = batchResults[i];
        
        if (batchResult && batchResult.success) {
          const tags = {};
          edge.node.tags.forEach(tag => {
            tags[tag.name] = tag.value;
          });
          
          blockchainResults.push({
            id: edge.node.id,
            data: batchResult.data,
            tags,
            timestamp: parseInt(tags.timestamp) || (edge.node.block?.timestamp * 1000) || 0,
            blockHeight: edge.node.block?.height || 0,
            isRecent: false
          });
        }
      }
      
      // 6. Объединяем и дедуплицируем результаты
      const allResults = [...results, ...blockchainResults];
      const uniqueResults = [];
      const seenIds = new Set();
      
      for (const result of allResults) {
        if (!seenIds.has(result.id)) {
          seenIds.add(result.id);
          uniqueResults.push(result);
        }
      }
      
      // 7. Сортируем по времени (новые первыми)
      uniqueResults.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`Loaded ${uniqueResults.length} total unique transactions`);
      
      // 8. Кэшируем результат
      this.setCachedData(cacheKey, uniqueResults);
      
      return uniqueResults;
      
    } catch (e) {
      console.error('Critical error in loadDataByWallet:', e);
      // В крайнем случае возвращаем пустой массив
      return [];
    }
  }
  
  async loadPages(forceRefresh = false) {
    try {
      const results = await this.loadDataByWallet('pages', true, forceRefresh);
      if (results.length === 0) return {};
      
      // Результаты уже отсортированы по времени в loadDataByWallet
      const latest = results[0];
      return latest.data || {};
    } catch (e) {
      console.error('Failed to load pages:', e);
      return {};
    }
  }

  async savePage(page) {
    try {
      let walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) {
        walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }
      }
      
      const id = await this.saveDataToIrys(page, 'page', walletAddress);
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  async savePages(pages) {
    try {
      let walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) {
        walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }
      }
      
      const id = await this.saveDataToIrys(pages, 'pages', walletAddress, [
        { name: 'pages_count', value: Object.keys(pages).length.toString() }
      ]);
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async loadWorkspace(forceRefresh = false) {
    try {
      const results = await this.loadDataByWallet('workspace', true, forceRefresh);
      if (results.length === 0) return null;
      
      // Результаты уже отсортированы по времени в loadDataByWallet
      const latest = results[0];
      return latest.data || null;
    } catch (e) {
      console.error('Failed to load workspace:', e);
      return null;
    }
  }
  
  async saveWorkspace(workspace) {
    try {
      let walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) {
        walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }
      }
      
      const id = await this.saveDataToIrys(workspace, 'workspace', walletAddress, [
        { name: 'workspace_name', value: workspace.name || 'Untitled' },
        { name: 'projects_count', value: Object.keys(workspace.projects || {}).length.toString() }
      ]);
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Сохранение Database таблиц
  async saveDatabase(databaseData) {
    try {
      const id = await this.saveDataToIrys(databaseData, 'database', [
        { name: 'table_title', value: databaseData.title || 'Untitled Table' },
        { name: 'columns_count', value: (databaseData.columns || []).length.toString() },
        { name: 'rows_count', value: (databaseData.rows || []).length.toString() }
      ]);
      return { success: true, id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Загрузка Database таблиц
  async loadDatabase(forceRefresh = false) {
    try {
      const results = await this.loadDataByWallet('database', true, forceRefresh);
      if (results.length === 0) return null;
      
      // Результаты уже отсортированы по времени в loadDataByWallet
      const latest = results[0];
      return latest.data || null;
    } catch (e) {
      console.error('Failed to load database:', e);
      return null;
    }
  }

  // Сохранение всех данных приложения (комплексное сохранение)
  async saveAllAppData(appData) {
    try {
      const results = {};
      
      // Сохраняем workspace
      if (appData.workspace) {
        const workspaceResult = await this.saveWorkspace(appData.workspace);
        results.workspace = workspaceResult;
      }
      
      // Сохраняем pages
      if (appData.pages) {
        const pagesResult = await this.savePages(appData.pages);
        results.pages = pagesResult;
      }
      
      // Сохраняем database таблицы
      if (appData.database) {
        const databaseResult = await this.saveDatabase(appData.database);
        results.database = databaseResult;
      }
      
      // Сохраняем общий snapshot всего приложения
      const snapshotResult = await this.saveDataToIrys(appData, 'app-snapshot', [
        { name: 'snapshot_type', value: 'full-app-backup' },
        { name: 'components', value: Object.keys(appData).join(',') }
      ]);
      results.snapshot = snapshotResult;
      
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Загрузка всех данных приложения
  async loadAllAppData() {
    try {
      const [workspace, pages, database] = await Promise.all([
        this.loadWorkspace(),
        this.loadPages(), 
        this.loadDatabase()
      ]);
      
      return {
        workspace,
        pages,
        database,
        timestamp: Date.now()
      };
    } catch (e) {
      console.error('Failed to load all app data:', e);
      return {
        workspace: null,
        pages: null,
        database: null,
        timestamp: Date.now()
      };
    }
  }

  disconnectWallet() {
    // Сохраняем данные перед отключением
    this.savePersistentData();
    
    // Очищаем только текущий кэш
    this.cache.clear();
    
    // Очищаем статус подключения
    if (window.localStorage) {
      window.localStorage.removeItem('walletAddress');
      window.localStorage.removeItem('walletConnected');
    }
    
    return true;
  }

  // Утилиты для отладки и мониторинга
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      persistentDataSize: localStorage.getItem(this.persistentStorageKey)?.length || 0
    };
  }

  clearCache() {
    this.cache.clear();
    return true;
  }

  clearAllData() {
    this.cache.clear();
    localStorage.removeItem(this.persistentStorageKey);
    localStorage.removeItem('recentTransactions');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    return true;
  }

  // Принудительная синхронизация с блокчейном (игнорирует кэш)
  async forceSync(dataType = null) {
    const walletAddress = window.ethereum?.selectedAddress || localStorage.getItem('walletAddress');
    if (!walletAddress) return [];
    
    // Сбрасываем флаг недоступности блокчейна
    this.markBlockchainAvailable();
    
    // Очищаем кэш для этого типа данных
    const cacheKey = `wallet_${walletAddress}_${dataType || 'all'}`;
    this.cache.delete(cacheKey);
    
    // Загружаем заново с принудительным обновлением
    return await this.loadDataByWallet(dataType, false, true);
  }

  // Синхронизация всех данных приложения (для решения проблемы с разными доменами)
  async syncAllData() {
    try {
      console.log('🔄 Starting full data sync from blockchain...');
      
      const [workspace, pages, database] = await Promise.all([
        this.loadWorkspace(true), // forceRefresh = true
        this.loadPages(true),     // forceRefresh = true
        this.loadDatabase(true)   // forceRefresh = true (нужно добавить параметр)
      ]);
      
      console.log('✅ Full data sync completed');
      return {
        workspace,
        pages,
        database,
        synced: true,
        timestamp: Date.now()
      };
    } catch (e) {
      console.error('❌ Full data sync failed:', e);
      return {
        workspace: null,
        pages: null,
        database: null,
        synced: false,
        error: e.message
      };
    }
  }

  // Получение статуса блокчейна
  getBlockchainStatus() {
    return {
      available: !this.blockchainUnavailable,
      lastCheck: this.lastBlockchainCheck,
      nextCheck: this.lastBlockchainCheck + this.blockchainCheckInterval
    };
  }

  // Получение Application ID
  getApplicationId() {
    return 'irys-notebook';
  }

  // Поиск данных по типу с детальной информацией
  async getDataByType(dataType) {
    try {
      const results = await this.loadDataByWallet(dataType);
      return results.map(item => ({
        id: item.id,
        type: item.tags?.type || 'unknown',
        timestamp: item.timestamp,
        size: JSON.stringify(item.data).length,
        tags: item.tags,
        preview: this.generateDataPreview(item.data, dataType)
      }));
    } catch (e) {
      console.error(`Failed to get data by type ${dataType}:`, e);
      return [];
    }
  }

  // Генерация превью данных
  generateDataPreview(data, type) {
    try {
      switch (type) {
        case 'workspace':
          return `Workspace: ${data.name || 'Untitled'} (${Object.keys(data.projects || {}).length} projects)`;
        case 'pages':
          return `Pages: ${Object.keys(data || {}).length} pages`;
        case 'database':
          return `Table: ${data.title || 'Untitled'} (${(data.rows || []).length} rows, ${(data.columns || []).length} columns)`;
        case 'page':
          return `Page: ${data.title || 'Untitled'} (${(data.blocks || []).length} blocks)`;
        default:
          return `${type}: ${JSON.stringify(data).substring(0, 100)}...`;
      }
    } catch (e) {
      return `${type}: [Preview unavailable]`;
    }
  }

  // Получение истории версий для конкретного типа данных
  async getDataHistory(dataType, limit = 10) {
    try {
      const results = await this.loadDataByWallet(dataType, false);
      return results.slice(0, limit).map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        blockHeight: item.blockHeight,
        size: JSON.stringify(item.data).length,
        tags: item.tags
      }));
    } catch (e) {
      console.error('Failed to get data history:', e);
      return [];
    }
  }
}

export const irysService = new IrysService();
export default irysService;

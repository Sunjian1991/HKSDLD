import { Equipment, Rune, Hero, Build, Category } from '../types';

// 定义存储数据结构，与AppState保持一致
interface StoredData {
  equipment: Equipment[];
  runes: Rune[];
  runeCategories: Category[];
  heroes: Hero[];
  heroCategories: Category[];
  builds: Build[];
  version: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'lol-manager-data';
const VERSION = '1.0.0';
const STORAGE_FILE = 'storage/lol-manager-data.json';

// 测试localStorage是否可用
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return value === testKey;
  } catch (e) {
    console.error('localStorage test failed:', e);
    return false;
  }
};

const storageAvailable = isLocalStorageAvailable();
console.log('localStorage available:', storageAvailable);

// 内存存储作为后备
let memoryStorage: StoredData = {
  equipment: [],
  runes: [],
  runeCategories: [],
  heroes: [],
  heroCategories: [],
  builds: [],
  version: VERSION,
  lastUpdated: new Date().toISOString(),
};

// 保存数据到服务器
const saveToServer = async (data: StoredData): Promise<boolean> => {
  try {
    console.log('Attempting to save data to server');
    
    const response = await fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      console.log('Data saved to server successfully');
      // 同时更新localStorage作为缓存
      if (storageAvailable) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Data saved to localStorage as cache');
      }
      return true;
    } else {
      console.error('Failed to save data to server:', response.statusText);
      // 失败时使用localStorage作为后备
      if (storageAvailable) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Data saved to localStorage as fallback');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Failed to save data to server:', error);
    // 网络错误时使用localStorage作为后备
    if (storageAvailable) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Data saved to localStorage as fallback');
      return true;
    }
    return false;
  }
};

// 从服务器加载数据
const loadFromServer = async (): Promise<StoredData | null> => {
  try {
    console.log('Attempting to load data from server');
    
    const response = await fetch('http://localhost:3001/api/data');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Data loaded from server successfully');
      // 同时更新localStorage作为缓存
      if (storageAvailable) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Data saved to localStorage as cache');
      }
      return data;
    } else {
      console.error('Failed to load data from server:', response.statusText);
      // 失败时从localStorage加载
      if (storageAvailable) {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          console.log('Data loaded from localStorage as fallback');
          return JSON.parse(data);
        }
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to load data from server:', error);
    // 网络错误时从localStorage加载
    if (storageAvailable) {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        console.log('Data loaded from localStorage as fallback');
        return JSON.parse(data);
      }
    }
    return null;
  }
};

// 自动保存数据
export const saveData = async (data: any) => {
  try {
    // 确保数据结构正确
    const currentData = loadData();
    const updatedData: StoredData = {
      equipment: data.equipment || currentData.equipment || [],
      runes: data.runes || currentData.runes || [],
      runeCategories: data.runeCategories || currentData.runeCategories || [],
      heroes: data.heroes || currentData.heroes || [],
      heroCategories: data.heroCategories || currentData.heroCategories || [],
      builds: data.builds || currentData.builds || [],
      version: VERSION,
      lastUpdated: new Date().toISOString(),
    };
    
    // 检查数据大小
    const dataString = JSON.stringify(updatedData);
    const dataSize = new Blob([dataString]).size;
    console.log('Data size:', dataSize, 'bytes');
    
    // 保存到服务器
    await saveToServer(updatedData);
    
    // 同时更新内存存储
    memoryStorage = updatedData;
    console.log('Data saved to memory storage successfully');
    console.log('Saved data:', updatedData);
    
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
};

// 加载数据
export const loadData = (): StoredData => {
  try {
    // 首先尝试从localStorage加载（同步）
    if (storageAvailable) {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log('Data loaded from localStorage successfully');
          
          // 验证数据结构
          const validData: StoredData = {
            equipment: parsedData.equipment || [],
            runes: parsedData.runes || [],
            runeCategories: parsedData.runeCategories || [],
            heroes: parsedData.heroes || [],
            heroCategories: parsedData.heroCategories || [],
            builds: parsedData.builds || [],
            version: parsedData.version || VERSION,
            lastUpdated: parsedData.lastUpdated || new Date().toISOString(),
          };
          
          // 更新内存存储
          memoryStorage = validData;
          console.log('Data loaded:', validData);
          
          // 异步从服务器加载最新数据
          loadFromServer().then(serverData => {
            if (serverData) {
              memoryStorage = serverData;
              console.log('Data updated from server');
            }
          });
          
          return validData;
        } catch (error) {
          console.error('Failed to parse stored data:', error);
          // 解析失败时使用内存存储
          console.log('Using memory storage instead');
        }
      } else {
        console.log('No data found in localStorage, using memory storage');
        // 异步从服务器加载数据
        loadFromServer().then(serverData => {
          if (serverData) {
            memoryStorage = serverData;
            console.log('Data loaded from server');
          }
        });
      }
    } else {
      console.warn('localStorage not available, using memory storage');
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  
  console.log('Returning memory storage data:', memoryStorage);
  return memoryStorage;
};

// 强制从服务器加载数据
export const loadDataFromServer = async (): Promise<StoredData> => {
  const data = await loadFromServer();
  if (data) {
    memoryStorage = data;
    return data;
  }
  return loadData();
};

// 导出数据到文件
export const exportData = (): string => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

// 导入数据
export const importData = async (json: string): Promise<StoredData> => {
  try {
    const data = JSON.parse(json);
    // 验证导入的数据结构
    const validData: StoredData = {
      equipment: data.equipment || [],
      runes: data.runes || [],
      runeCategories: data.runeCategories || [],
      heroes: data.heroes || [],
      heroCategories: data.heroCategories || [],
      builds: data.builds || [],
      version: VERSION,
      lastUpdated: new Date().toISOString(),
    };
    
    // 保存到所有存储
    await saveData(validData);
    
    console.log('Data imported successfully:', validData);
    return validData;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
};

// 清除所有数据
export const clearData = async (): Promise<void> => {
  try {
    if (storageAvailable) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Data cleared from localStorage');
    }
    // 同时清除内存存储
    memoryStorage = {
      equipment: [],
      runes: [],
      runeCategories: [],
      heroes: [],
      heroCategories: [],
      builds: [],
      version: VERSION,
      lastUpdated: new Date().toISOString(),
    };
    console.log('Data cleared from memory storage');
    
    // 保存空数据到文件
    await saveData(memoryStorage);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

// 获取存储状态
export const getStorageStatus = (): {
  available: boolean;
  size: number;
  data: StoredData;
  file: string;
} => {
  const data = loadData();
  const dataString = JSON.stringify(data);
  const size = new Blob([dataString]).size;
  
  return {
    available: storageAvailable,
    size,
    data,
    file: STORAGE_FILE,
  };
};
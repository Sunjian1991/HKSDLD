import { useState, useEffect } from 'react';
import EquipmentManager from './components/EquipmentManager';
import RuneManager from './components/RuneManager';
import HeroManager from './components/HeroManager';
import BuildManager from './components/BuildManager';
import DataSync from './components/DataSync';

import { Equipment, Rune, Hero, Build, Category } from './types';
import { saveData, loadData, loadDataFromServer } from './utils/storage';

interface AppState {
  equipment: Equipment[];
  runes: Rune[];
  runeCategories: Category[];
  heroes: Hero[];
  heroCategories: Category[];
  builds: Build[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'runes' | 'heroes' | 'builds' | 'sync'>('equipment');
  const [state, setState] = useState<AppState>(() => {
    const savedData = loadData();
    return {
      equipment: savedData.equipment || [],
      runes: savedData.runes || [],
      runeCategories: savedData.runeCategories || [],
      heroes: savedData.heroes || [],
      heroCategories: savedData.heroCategories || [],
      builds: savedData.builds || [],
    };
  });

  // 应用启动时从服务器加载最新数据
  useEffect(() => {
    const loadLatestData = async () => {
      try {
        const latestData = await loadDataFromServer();
        setState({
          equipment: latestData.equipment || [],
          runes: latestData.runes || [],
          runeCategories: latestData.runeCategories || [],
          heroes: latestData.heroes || [],
          heroCategories: latestData.heroCategories || [],
          builds: latestData.builds || [],
        });
      } catch (error) {
        console.error('Failed to load latest data:', error);
      }
    };
    loadLatestData();
  }, []);

  const handleDataChange = async (newState: Partial<AppState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    await saveData(updatedState);
  };



  return (
    <div className="app">
      <header className="app-header">
        <h1>英雄联盟装备、符文、英雄及流派管理</h1>
      </header>
      
      <nav className="app-nav">
        <button 
          className={activeTab === 'equipment' ? 'active' : ''}
          onClick={() => setActiveTab('equipment')}
        >
          装备管理
        </button>
        <button 
          className={activeTab === 'runes' ? 'active' : ''}
          onClick={() => setActiveTab('runes')}
        >
          海克斯符文管理
        </button>
        <button 
          className={activeTab === 'heroes' ? 'active' : ''}
          onClick={() => setActiveTab('heroes')}
        >
          英雄池管理
        </button>
        <button 
          className={activeTab === 'builds' ? 'active' : ''}
          onClick={() => setActiveTab('builds')}
        >
          流派管理
        </button>
        <button 
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          数据同步
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'equipment' && (
          <EquipmentManager
            equipment={state.equipment}
            onDataChange={(equipment) => 
              handleDataChange({ equipment })
            }
          />
        )}
        {activeTab === 'runes' && (
          <RuneManager
            runes={state.runes}
            categories={state.runeCategories}
            onDataChange={(runes, categories) => 
              handleDataChange({ runes, runeCategories: categories })
            }
          />
        )}
        {activeTab === 'heroes' && (
          <HeroManager
            heroes={state.heroes}
            categories={state.heroCategories}
            onDataChange={(heroes, categories) => 
              handleDataChange({ heroes, heroCategories: categories })
            }
          />
        )}
        {activeTab === 'builds' && (
          <BuildManager
            builds={state.builds}
            equipment={state.equipment}
            runes={state.runes}
            heroCategories={state.heroCategories}
            onDataChange={(builds) => handleDataChange({ builds })}
          />
        )}
        {activeTab === 'sync' && (
          <DataSync
            data={state}
            onDataImport={(importedData) => handleDataChange(importedData)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
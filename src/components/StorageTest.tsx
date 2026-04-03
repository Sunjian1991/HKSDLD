import { useState, useEffect } from 'react';
import { saveData, loadData, getStorageStatus, clearData } from '../utils/storage';

function StorageTest() {
  const [storageStatus, setStorageStatus] = useState({ available: false, size: 0 });
  const [testCount, setTestCount] = useState(0);
  const [dataStats, setDataStats] = useState({
    equipment: 0,
    runes: 0,
    runeCategories: 0,
    heroes: 0,
    heroCategories: 0,
    builds: 0,
  });

  useEffect(() => {
    updateStorageStatus();
  }, []);

  const updateStorageStatus = () => {
    const status = getStorageStatus();
    setStorageStatus({ available: status.available, size: status.size });
    setDataStats({
      equipment: status.data.equipment.length,
      runes: status.data.runes.length,
      runeCategories: status.data.runeCategories.length,
      heroes: status.data.heroes.length,
      heroCategories: status.data.heroCategories.length,
      builds: status.data.builds.length,
    });
    console.log('Storage status updated:', status);
  };

  const handleTestSave = () => {
    const newCount = testCount + 1;
    setTestCount(newCount);
    
    // 创建测试数据
    const testHero = {
      id: `test-${Date.now()}`,
      name: `测试英雄 ${newCount}`,
      aliases: [`测试${newCount}`, `TEST${newCount}`],
      title: `测试之王 ${newCount}`,
      categoryId: 'default'
    };
    
    const testEquipment = {
      id: `eq-${Date.now()}`,
      name: `测试装备 ${newCount}`,
      attributes: ['攻击力', '生命值', '法力值']
    };
    
    // 保存测试数据
    const result = saveData({
      heroes: [...loadData().heroes, testHero],
      equipment: [...loadData().equipment, testEquipment]
    });
    
    console.log('Test save result:', result);
    setTimeout(updateStorageStatus, 100);
  };

  const handleLoadData = () => {
    const data = loadData();
    console.log('Loaded data:', data);
    updateStorageStatus();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      clearData();
      console.log('All data cleared');
      updateStorageStatus();
    }
  };

  return (
    <div className="storage-test">
      <h2>存储测试</h2>
      
      <div className="storage-status">
        <h3>存储状态</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">localStorage 状态:</span>
            <span className={`status-value ${storageStatus.available ? 'available' : 'unavailable'}`}>
              {storageStatus.available ? '可用' : '不可用'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">数据大小:</span>
            <span className="status-value">{storageStatus.size} bytes</span>
          </div>
        </div>
      </div>
      
      <div className="data-stats">
        <h3>数据统计</h3>
        <div className="stats-grid">
          <div className="stat-item">装备: {dataStats.equipment}</div>
          <div className="stat-item">符文: {dataStats.runes}</div>
          <div className="stat-item">符文分类: {dataStats.runeCategories}</div>
          <div className="stat-item">英雄: {dataStats.heroes}</div>
          <div className="stat-item">英雄分类: {dataStats.heroCategories}</div>
          <div className="stat-item">流派: {dataStats.builds}</div>
        </div>
      </div>
      
      <div className="test-actions">
        <h3>测试操作</h3>
        <div className="action-buttons">
          <button onClick={handleTestSave} className="test-btn">
            测试保存数据 (计数: {testCount})
          </button>
          <button onClick={handleLoadData} className="test-btn">
            测试加载数据
          </button>
          <button onClick={handleClearData} className="clear-btn">
            清除所有数据
          </button>
        </div>
      </div>
      
      <div className="test-info">
        <h3>测试信息</h3>
        <p>• 点击"测试保存数据"按钮，会添加一个测试英雄和装备</p>
        <p>• 点击"测试加载数据"按钮，会重新加载并显示当前数据</p>
        <p>• 点击"清除所有数据"按钮，会清除所有存储的数据</p>
        <p>• 数据会自动保存到localStorage中，刷新页面后不会丢失</p>
        <p>• 所有操作都会在控制台显示详细日志</p>
      </div>
    </div>
  );
}

export default StorageTest;
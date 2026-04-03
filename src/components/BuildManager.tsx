import { useState } from 'react';
import { Build, Equipment, Rune, Category } from '../types';

interface BuildManagerProps {
  builds: Build[];
  equipment: Equipment[];
  runes: Rune[];
  heroCategories: Category[];
  onDataChange: (builds: Build[]) => void;
}

function BuildManager({ builds, equipment, runes, heroCategories, onDataChange }: BuildManagerProps) {
  const [newBuildName, setNewBuildName] = useState('');
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [selectedHeroCategoryId, setSelectedHeroCategoryId] = useState('');
  const [selectedRuneIds, setSelectedRuneIds] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  
  // 搜索状态
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [runeSearchTerm, setRuneSearchTerm] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddBuild = () => {
    if (newBuildName.trim() && selectedHeroCategoryId) {
      const newBuild: Build = {
        id: generateId(),
        name: newBuildName.trim(),
        heroCategoryId: selectedHeroCategoryId,
        runeIds: selectedRuneIds,
        equipmentIds: selectedEquipmentIds,
      };
      onDataChange([...builds, newBuild]);
      resetForm();
    }
  };

  const handleUpdateBuild = () => {
    if (editingBuild && selectedHeroCategoryId) {
      const updatedBuild: Build = {
        ...editingBuild,
        name: newBuildName.trim(),
        heroCategoryId: selectedHeroCategoryId,
        runeIds: selectedRuneIds,
        equipmentIds: selectedEquipmentIds,
      };
      const updatedBuilds = builds.map(build =>
        build.id === editingBuild.id ? updatedBuild : build
      );
      onDataChange(updatedBuilds);
      resetForm();
    }
  };

  const handleDeleteBuild = (buildId: string) => {
    const updatedBuilds = builds.filter(build => build.id !== buildId);
    onDataChange(updatedBuilds);
  };

  const handleDeleteAllBuilds = () => {
    if (builds.length > 0 && window.confirm('确定要删除所有流派吗？此操作不可撤销。')) {
      onDataChange([]);
    }
  };

  const handleEditBuild = (build: Build) => {
    setEditingBuild(build);
    setNewBuildName(build.name);
    setSelectedHeroCategoryId(build.heroCategoryId);
    setSelectedRuneIds([...build.runeIds]);
    setSelectedEquipmentIds([...build.equipmentIds]);
  };

  const resetForm = () => {
    setNewBuildName('');
    setEditingBuild(null);
    setSelectedHeroCategoryId('');
    setSelectedRuneIds([]);
    setSelectedEquipmentIds([]);
    setEquipmentSearchTerm('');
    setRuneSearchTerm('');
  };

  const handleRuneToggle = (runeId: string) => {
    setSelectedRuneIds(prev =>
      prev.includes(runeId)
        ? prev.filter(id => id !== runeId)
        : [...prev, runeId]
    );
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    setSelectedEquipmentIds(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  // 过滤装备（根据名称和属性搜索）
  const filteredEquipment = equipment.filter(item => {
    if (!equipmentSearchTerm) return true;
    const searchLower = equipmentSearchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.attributes.some(attr => attr.toLowerCase().includes(searchLower))
    );
  });

  // 过滤符文（根据名称搜索）
  const filteredRunes = runes.filter(rune => {
    if (!runeSearchTerm) return true;
    return rune.name.toLowerCase().includes(runeSearchTerm.toLowerCase());
  });

  return (
    <div className="build-manager">
      <h2>流派管理 <span className="count-badge">{builds.length} 个流派</span></h2>
      
      {/* 流派编辑表单 */}
      <div className="build-form">
        <h3>{editingBuild ? '编辑流派' : '创建流派'}</h3>
        <div className="form-group">
          <label>流派名称</label>
          <input
            type="text"
            placeholder="输入流派名称"
            value={newBuildName}
            onChange={(e) => setNewBuildName(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>关联英雄分类</label>
          <select
            value={selectedHeroCategoryId}
            onChange={(e) => setSelectedHeroCategoryId(e.target.value)}
          >
            <option value="">选择英雄分类</option>
            {heroCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        
        {/* 符文选择区域 */}
        <div className="form-group">
          <label>选择符文 ({selectedRuneIds.length} 已选)</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索符文名称..."
              value={runeSearchTerm}
              onChange={(e) => setRuneSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="checkbox-group rune-checkbox-group">
            {filteredRunes.length === 0 ? (
              <p className="no-results">没有找到匹配的符文</p>
            ) : (
              filteredRunes.map(rune => (
                <label key={rune.id} className={`checkbox-item ${selectedRuneIds.includes(rune.id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedRuneIds.includes(rune.id)}
                    onChange={() => handleRuneToggle(rune.id)}
                  />
                  <span className="rune-name">{rune.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
        
        {/* 装备选择区域 */}
        <div className="form-group">
          <label>选择装备 ({selectedEquipmentIds.length} 已选)</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索装备名称或属性..."
              value={equipmentSearchTerm}
              onChange={(e) => setEquipmentSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="equipment-selection-list">
            {filteredEquipment.length === 0 ? (
              <p className="no-results">没有找到匹配的装备</p>
            ) : (
              filteredEquipment.map(item => (
                <div 
                  key={item.id} 
                  className={`equipment-selection-item ${selectedEquipmentIds.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => handleEquipmentToggle(item.id)}
                >
                  <div className="equipment-selection-header">
                    <input
                      type="checkbox"
                      checked={selectedEquipmentIds.includes(item.id)}
                      onChange={() => handleEquipmentToggle(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="equipment-name">{item.name}</span>
                  </div>
                  {item.attributes.length > 0 && (
                    <div className="equipment-attributes">
                      {item.attributes.map((attr, index) => (
                        <span key={index} className="attribute-tag">{attr}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button onClick={editingBuild ? handleUpdateBuild : handleAddBuild}>
            {editingBuild ? '更新流派' : '创建流派'}
          </button>
          <button onClick={resetForm}>取消</button>
        </div>
      </div>
      
      {/* 流派列表 */}
      <div className="build-list">
        <div className="list-header">
          <h3>流派列表 <span className="count-badge">{builds.length} 个流派</span></h3>
          {builds.length > 0 && (
            <button onClick={handleDeleteAllBuilds} className="delete-all-btn">
              全部删除
            </button>
          )}
        </div>
        {builds.length === 0 ? (
          <p>暂无流派，请创建新流派</p>
        ) : (
          builds.map(build => {
            const heroCategory = heroCategories.find(cat => cat.id === build.heroCategoryId);
            const selectedRunesList = runes.filter(rune => build.runeIds.includes(rune.id));
            const selectedEquipmentList = equipment.filter(item => build.equipmentIds.includes(item.id));
            
            return (
              <div key={build.id} className="build-item">
                <div className="build-header">
                  <h4>{build.name}</h4>
                  <div className="build-actions">
                    <button onClick={() => handleEditBuild(build)}>编辑</button>
                    <button onClick={() => handleDeleteBuild(build.id)}>删除</button>
                  </div>
                </div>
                <div className="build-details">
                  <p><strong>英雄分类：</strong>{heroCategory?.name || '未选择'}</p>
                  <p><strong>符文：</strong>{selectedRunesList.map(rune => rune.name).join(', ') || '无'}</p>
                  <div className="build-equipment">
                    <strong>装备：</strong>
                    {selectedEquipmentList.length === 0 ? (
                      '无'
                    ) : (
                      <div className="build-equipment-list">
                        {selectedEquipmentList.map(item => (
                          <div key={item.id} className="build-equipment-item">
                            <span className="equipment-name">{item.name}</span>
                            {item.attributes.length > 0 && (
                              <div className="equipment-attributes">
                                {item.attributes.map((attr, index) => (
                                  <span key={index} className="attribute-tag">{attr}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BuildManager;
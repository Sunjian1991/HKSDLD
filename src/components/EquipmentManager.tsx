import { useState } from 'react';
import { Equipment } from '../types';

interface EquipmentManagerProps {
  equipment: Equipment[];
  onDataChange: (equipment: Equipment[]) => void;
}

function EquipmentManager({ equipment, onDataChange }: EquipmentManagerProps) {
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newAttributes, setNewAttributes] = useState('');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [importText, setImportText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddEquipment = () => {
    if (newEquipmentName.trim()) {
      const newEquipment: Equipment = {
        id: generateId(),
        name: newEquipmentName.trim(),
        attributes: newAttributes.split(',').map(attr => attr.trim()).filter(attr => attr),
      };
      onDataChange([...equipment, newEquipment]);
      setNewEquipmentName('');
      setNewAttributes('');
    }
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    const updatedEquipmentList = equipment.map(item =>
      item.id === updatedEquipment.id ? updatedEquipment : item
    );
    onDataChange(updatedEquipmentList);
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    const updatedEquipmentList = equipment.filter(item => item.id !== equipmentId);
    onDataChange(updatedEquipmentList);
  };

  const handleDeleteAllEquipment = () => {
    if (equipment.length > 0 && window.confirm('确定要删除所有装备吗？此操作不可撤销。')) {
      onDataChange([]);
    }
  };

  const handleImportEquipment = () => {
    const lines = importText.split('\n').filter(line => line.trim());
    
    const newEquipmentList = lines.map(line => {
      const parts = line.split(',').map(part => part.trim()).filter(part => part);
      if (parts.length > 0) {
        return {
          id: generateId(),
          name: parts[0],
          attributes: parts.slice(1),
        };
      }
      return null;
    }).filter(item => item !== null) as Equipment[];
    
    if (newEquipmentList.length > 0) {
      onDataChange([...equipment, ...newEquipmentList]);
      setImportText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.attributes.some(attr => attr.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="equipment-manager">
      <h2>装备管理 <span className="count-badge">{equipment.length} 个装备</span></h2>
      
      {/* 搜索装备 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="搜索装备名称或属性..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {/* 添加装备 */}
      <div className="add-equipment-section">
        <h3>添加装备</h3>
        <div className="add-equipment">
          <input
            type="text"
            placeholder="输入装备名称"
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
          />
          <input
            type="text"
            placeholder="输入属性，用逗号分隔"
            value={newAttributes}
            onChange={(e) => setNewAttributes(e.target.value)}
          />
          <button onClick={handleAddEquipment}>添加装备</button>
        </div>
      </div>
      
      {/* 导入装备 */}
      <div className="import-section">
        <h3>批量导入装备</h3>
        <p className="import-hint">格式：每行一个装备，第一个字段是名称，后续字段是属性，用逗号分隔</p>
        
        <div className="file-upload">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
          />
        </div>
        
        <textarea
          placeholder="示例：&#10;无尽之刃,攻击力,暴击率,暴击伤害&#10;饮血剑,攻击力,生命偷取,护盾"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={6}
        />
        <button onClick={handleImportEquipment}>批量导入装备</button>
      </div>
      
      {/* 装备列表 */}
      <div className="equipment-list-section">
        <div className="list-header">
          <h3>装备列表 ({filteredEquipment.length})</h3>
          {equipment.length > 0 && (
            <button onClick={handleDeleteAllEquipment} className="delete-all-btn">
              全部删除
            </button>
          )}
        </div>
        <div className="equipment-list">
          {filteredEquipment.map(item => (
            <div key={item.id} className="equipment-item">
              {editingEquipment?.id === item.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingEquipment.name}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                    placeholder="装备名称"
                  />
                  <input
                    type="text"
                    value={editingEquipment.attributes.join(', ')}
                    onChange={(e) => setEditingEquipment({ 
                      ...editingEquipment, 
                      attributes: e.target.value.split(',').map(attr => attr.trim()).filter(attr => attr)
                    })}
                    placeholder="属性，用逗号分隔"
                  />
                  <button onClick={() => handleUpdateEquipment(editingEquipment)}>保存</button>
                  <button onClick={() => setEditingEquipment(null)}>取消</button>
                </div>
              ) : (
                <div className="equipment-info">
                  <div className="equipment-header">
                    <span className="equipment-name">{item.name}</span>
                    <div className="equipment-actions">
                      <button onClick={() => setEditingEquipment(item)}>编辑</button>
                      <button onClick={() => handleDeleteEquipment(item.id)}>删除</button>
                    </div>
                  </div>
                  {item.attributes.length > 0 && (
                    <div className="equipment-attributes">
                      {item.attributes.map((attr, index) => (
                        <span key={index} className="attribute-tag">{attr}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EquipmentManager;
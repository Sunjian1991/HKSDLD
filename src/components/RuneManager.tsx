import { useState } from 'react';
import { Rune, Category } from '../types';

interface RuneManagerProps {
  runes: Rune[];
  categories: Category[];
  onDataChange: (runes: Rune[], categories: Category[]) => void;
}

function RuneManager({ runes, categories, onDataChange }: RuneManagerProps) {
  const [newRuneName, setNewRuneName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingRune, setEditingRune] = useState<Rune | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [importText, setImportText] = useState('');
  const [importCategoryText, setImportCategoryText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddRune = () => {
    if (newRuneName.trim() && categories.length > 0) {
      const newRune: Rune = {
        id: generateId(),
        name: newRuneName.trim(),
        categoryId: categories[0].id,
      };
      onDataChange([...runes, newRune], categories);
      setNewRuneName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
      };
      onDataChange(runes, [...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const handleUpdateRune = (updatedRune: Rune) => {
    const updatedRuneList = runes.map(item =>
      item.id === updatedRune.id ? updatedRune : item
    );
    onDataChange(updatedRuneList, categories);
    setEditingRune(null);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    const updatedCategoryList = categories.map(item =>
      item.id === updatedCategory.id ? updatedCategory : item
    );
    onDataChange(runes, updatedCategoryList);
    setEditingCategory(null);
  };

  const handleDeleteRune = (runeId: string) => {
    const updatedRuneList = runes.filter(item => item.id !== runeId);
    onDataChange(updatedRuneList, categories);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategoryList = categories.filter(item => item.id !== categoryId);
    const updatedRuneList = runes.filter(item => item.categoryId !== categoryId);
    onDataChange(updatedRuneList, updatedCategoryList);
  };

  const handleDeleteAllRunes = () => {
    if (runes.length > 0 && window.confirm('确定要删除所有符文吗？此操作不可撤销。')) {
      onDataChange([], categories);
    }
  };

  const handleDeleteAllCategories = () => {
    if (categories.length > 0 && window.confirm('确定要删除所有分类吗？此操作会同时删除所有符文，不可撤销。')) {
      onDataChange([], []);
    }
  };

  const handleImportRunes = () => {
    const runeNames = importText
      .split(/[,，]/) // 支持英文逗号和中文逗号
      .map(name => name.trim())
      .filter(name => name);
    
    if (runeNames.length > 0) {
      let targetCategoryId = categories[0]?.id;
      let updatedCategories = categories;
      
      // 如果没有分类，自动创建一个默认分类
      if (!targetCategoryId) {
        const defaultCategory = {
          id: generateId(),
          name: '默认分类',
        };
        updatedCategories = [...categories, defaultCategory];
        targetCategoryId = defaultCategory.id;
      }
      
      const newRuneList = runeNames.map(name => ({
        id: generateId(),
        name,
        categoryId: targetCategoryId!,
      }));
      onDataChange([...runes, ...newRuneList], updatedCategories);
      setImportText('');
    }
  };

  const handleImportCategories = () => {
    const categoryNames = importCategoryText
      .split(/[,，]/) // 支持英文逗号和中文逗号
      .map(name => name.trim())
      .filter(name => name);
    
    if (categoryNames.length > 0) {
      const newCategoryList = categoryNames.map(name => ({
        id: generateId(),
        name,
      }));
      onDataChange(runes, [...categories, ...newCategoryList]);
      setImportCategoryText('');
    }
  };

  return (
    <div className="rune-manager">
      <h2>海克斯符文管理 <span className="count-badge">{runes.length} 个符文</span></h2>
      
      {/* 搜索符文 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="搜索符文名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {/* 分类管理 */}
      <div className="category-section">
        <h3>分类管理 <span className="count-badge">{categories.length} 个分类</span></h3>
        <div className="add-category">
          <input
            type="text"
            placeholder="输入分类名称"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button onClick={handleAddCategory}>添加分类</button>
        </div>
        
        <div className="import-section">
          <textarea
            placeholder="输入分类名称，用逗号分隔"
            value={importCategoryText}
            onChange={(e) => setImportCategoryText(e.target.value)}
            rows={3}
          />
          <button onClick={handleImportCategories}>批量导入分类</button>
        </div>
        
        <div className="list-header">
          <h4>分类列表 ({categories.length})</h4>
          {categories.length > 0 && (
            <button onClick={handleDeleteAllCategories} className="delete-all-btn">
              全部删除
            </button>
          )}
        </div>
        <div className="category-list">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              {editingCategory?.id === category.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                  <button onClick={() => handleUpdateCategory(editingCategory)}>保存</button>
                  <button onClick={() => setEditingCategory(null)}>取消</button>
                </div>
              ) : (
                <div className="category-info">
                  <span>{category.name}</span>
                  <div className="category-actions">
                    <button onClick={() => setEditingCategory(category)}>编辑</button>
                    <button onClick={() => handleDeleteCategory(category.id)}>删除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 符文管理 */}
      <div className="rune-section">
        <h3>符文管理</h3>
        <div className="add-rune">
          <input
            type="text"
            placeholder="输入符文名称"
            value={newRuneName}
            onChange={(e) => setNewRuneName(e.target.value)}
          />
          <button onClick={handleAddRune}>添加符文</button>
        </div>
        
        <div className="import-section">
          <textarea
            placeholder="输入符文名称，用逗号分隔"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={3}
          />
          <button onClick={handleImportRunes}>批量导入符文</button>
        </div>
        
        <div className="list-header">
          <h4>符文列表 ({runes.length})</h4>
          {runes.length > 0 && (
            <button onClick={handleDeleteAllRunes} className="delete-all-btn">
              全部删除
            </button>
          )}
        </div>
        <div className="rune-list">
          {categories.map(category => {
            const categoryRunes = runes.filter(item => 
              item.categoryId === category.id &&
              (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (categoryRunes.length === 0) return null;
            
            return (
              <div key={category.id} className="category-runes">
                <h4>{category.name} ({categoryRunes.length})</h4>
                <div className="rune-items">
                  {categoryRunes.map(item => (
                    <div key={item.id} className="rune-item">
                      {editingRune?.id === item.id ? (
                        <div className="edit-form">
                          <input
                            type="text"
                            value={editingRune.name}
                            onChange={(e) => setEditingRune({ ...editingRune, name: e.target.value })}
                          />
                          <select
                            value={editingRune.categoryId}
                            onChange={(e) => setEditingRune({ ...editingRune, categoryId: e.target.value })}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleUpdateRune(editingRune)}>保存</button>
                          <button onClick={() => setEditingRune(null)}>取消</button>
                        </div>
                      ) : (
                        <div className="rune-info">
                          <span>{item.name}</span>
                          <div className="rune-actions">
                            <button onClick={() => setEditingRune(item)}>编辑</button>
                            <button onClick={() => handleDeleteRune(item.id)}>删除</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RuneManager;
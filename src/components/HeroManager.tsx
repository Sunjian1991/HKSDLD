import { useState } from 'react';
import { Hero, Category } from '../types';

interface HeroManagerProps {
  heroes: Hero[];
  categories: Category[];
  onDataChange: (heroes: Hero[], categories: Category[]) => void;
}

function HeroManager({ heroes, categories, onDataChange }: HeroManagerProps) {
  const [newHeroName, setNewHeroName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [importText, setImportText] = useState('');
  const [importCategoryText, setImportCategoryText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddHero = () => {
    if (newHeroName.trim() && categories.length > 0) {
      const newHero: Hero = {
        id: generateId(),
        name: newHeroName.trim(),
        categoryId: categories[0].id,
      };
      onDataChange([...heroes, newHero], categories);
      setNewHeroName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
      };
      onDataChange(heroes, [...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const handleUpdateHero = (updatedHero: Hero) => {
    const updatedHeroList = heroes.map(item =>
      item.id === updatedHero.id ? updatedHero : item
    );
    onDataChange(updatedHeroList, categories);
    setEditingHero(null);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    const updatedCategoryList = categories.map(item =>
      item.id === updatedCategory.id ? updatedCategory : item
    );
    onDataChange(heroes, updatedCategoryList);
    setEditingCategory(null);
  };

  const handleDeleteHero = (heroId: string) => {
    const updatedHeroList = heroes.filter(item => item.id !== heroId);
    onDataChange(updatedHeroList, categories);
  };

  const handleBatchDeleteHeroes = () => {
    if (selectedHeroIds.length > 0) {
      const updatedHeroList = heroes.filter(item => !selectedHeroIds.includes(item.id));
      onDataChange(updatedHeroList, categories);
      setSelectedHeroIds([]);
    }
  };

  const [batchCategoryId, setBatchCategoryId] = useState('');

  const handleBatchCategory = () => {
    if (selectedHeroIds.length > 0 && batchCategoryId) {
      const updatedHeroList = heroes.map(hero =>
        selectedHeroIds.includes(hero.id)
          ? { ...hero, categoryId: batchCategoryId }
          : hero
      );
      onDataChange(updatedHeroList, categories);
      setSelectedHeroIds([]);
      setBatchCategoryId('');
    }
  };

  const handleHeroSelect = (heroId: string) => {
    setSelectedHeroIds(prev =>
      prev.includes(heroId)
        ? prev.filter(id => id !== heroId)
        : [...prev, heroId]
    );
  };

  // 过滤英雄列表
  const filteredHeroes = heroes.filter(item => 
    searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategoryList = categories.filter(item => item.id !== categoryId);
    const updatedHeroList = heroes.filter(item => item.categoryId !== categoryId);
    onDataChange(updatedHeroList, updatedCategoryList);
  };

  const handleDeleteAllHeroes = () => {
    if (heroes.length > 0 && window.confirm('确定要删除所有英雄吗？此操作不可撤销。')) {
      onDataChange([], categories);
    }
  };

  const handleDeleteAllCategories = () => {
    if (categories.length > 0 && window.confirm('确定要删除所有分类吗？此操作会同时删除所有英雄，不可撤销。')) {
      onDataChange([], []);
    }
  };

  const handleImportHeroes = () => {
    const heroEntries = importText
      .split(/[,，]/) // 支持英文逗号和中文逗号
      .map(entry => entry.trim())
      .filter(entry => entry);
    
    if (heroEntries.length > 0) {
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
      
      const newHeroList: Hero[] = [];
      const existingHeroes = heroes.map(hero => ({
        name: hero.name.toLowerCase(),
        alias: hero.alias?.toLowerCase(),
        title: hero.title?.toLowerCase()
      }));
      
      heroEntries.forEach(entry => {
        // 解析英雄信息，格式支持：名称、名称(别名)、名称[称号]、名称(别名)[称号]
        let name = entry;
        let alias = '';
        let title = '';
        
        // 提取别名 (别名)
        const aliasMatch = entry.match(/\(([^)]+)\)/);
        if (aliasMatch) {
          alias = aliasMatch[1].trim();
          name = entry.replace(aliasMatch[0], '').trim();
        }
        
        // 提取称号 [称号]
        const titleMatch = name.match(/\[([^\]]+)\]/);
        if (titleMatch) {
          title = titleMatch[1].trim();
          name = name.replace(titleMatch[0], '').trim();
        }
        
        // 检查是否重复
        const isDuplicate = existingHeroes.some(existing => 
          existing.name === name.toLowerCase() ||
          (alias && existing.alias === alias.toLowerCase()) ||
          (title && existing.title === title.toLowerCase())
        );
        
        if (!isDuplicate && name) {
          newHeroList.push({
            id: generateId(),
            name,
            alias: alias || undefined,
            title: title || undefined,
            categoryId: targetCategoryId!,
          });
        }
      });
      
      if (newHeroList.length > 0) {
        onDataChange([...heroes, ...newHeroList], updatedCategories);
        setImportText('');
      }
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
      onDataChange(heroes, [...categories, ...newCategoryList]);
      setImportCategoryText('');
    }
  };

  return (
    <div className="hero-manager">
      <h2>英雄池管理 <span className="count-badge">{heroes.length} 个英雄</span></h2>
      
      {/* 搜索英雄 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="搜索英雄名称..."
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
      
      {/* 英雄管理 */}
      <div className="hero-section">
        <h3>英雄管理</h3>
        <div className="add-hero">
          <input
            type="text"
            placeholder="输入英雄名称"
            value={newHeroName}
            onChange={(e) => setNewHeroName(e.target.value)}
          />
          <button onClick={handleAddHero}>添加英雄</button>
        </div>
        
        <div className="import-section">
          <p className="import-hint">格式：输入英雄名称，用逗号分隔，支持添加别名和称号<br/>
          示例：盖伦, 赵信(信爷), 亚索[疾风剑豪], 拉克丝(光辉女郎)[光辉女神]</p>
          <textarea
            placeholder="示例：盖伦, 赵信(信爷), 亚索[疾风剑豪], 拉克丝(光辉女郎)[光辉女神]"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={3}
          />
          <button onClick={handleImportHeroes}>批量导入英雄</button>
        </div>
        
        <div className="hero-list">
          {/* 全部删除按钮 */}
          <div className="list-header">
            <h4>英雄列表 ({heroes.length})</h4>
            {heroes.length > 0 && (
              <button onClick={handleDeleteAllHeroes} className="delete-all-btn">
                全部删除
              </button>
            )}
          </div>
          
          {/* 批量操作按钮 */}
          {selectedHeroIds.length > 0 && (
            <div className="batch-actions">
              <div className="batch-actions-left">
                <span>已选择 {selectedHeroIds.length} 个英雄</span>
              </div>
              <div className="batch-actions-right">
                <select
                  value={batchCategoryId}
                  onChange={(e) => setBatchCategoryId(e.target.value)}
                  className="batch-category-select"
                >
                  <option value="">选择分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button 
                  onClick={handleBatchCategory} 
                  className="batch-category-btn"
                  disabled={!batchCategoryId}
                >
                  批量分类
                </button>
                <button onClick={handleBatchDeleteHeroes} className="batch-delete-btn">
                  批量删除
                </button>
              </div>
            </div>
          )}
          
          {categories.map(category => {
            const categoryHeroes = heroes.filter(item => 
              item.categoryId === category.id &&
              (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (categoryHeroes.length === 0) return null;
            
            return (
              <div key={category.id} className="category-heroes">
                <h4>{category.name} ({categoryHeroes.length})</h4>
                <div className="hero-items">
                  {categoryHeroes.map(item => (
                    <div key={item.id} className="hero-item">
                      {editingHero?.id === item.id ? (
                        <div className="edit-form">
                          <input
                            type="text"
                            value={editingHero.name}
                            onChange={(e) => setEditingHero({ ...editingHero, name: e.target.value })}
                          />
                          <select
                            value={editingHero.categoryId}
                            onChange={(e) => setEditingHero({ ...editingHero, categoryId: e.target.value })}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleUpdateHero(editingHero)}>保存</button>
                          <button onClick={() => setEditingHero(null)}>取消</button>
                        </div>
                      ) : (
                        <div className="hero-info">
                          <div className="hero-select">
                            <input
                              type="checkbox"
                              checked={selectedHeroIds.includes(item.id)}
                              onChange={() => handleHeroSelect(item.id)}
                            />
                          </div>
                          <div className="hero-details">
                            <span className="hero-name">{item.name}</span>
                            {item.alias && <span className="hero-alias">({item.alias})</span>}
                            {item.title && <span className="hero-title">[{item.title}]</span>}
                          </div>
                          <div className="hero-actions">
                            <button onClick={() => setEditingHero(item)}>编辑</button>
                            <button onClick={() => handleDeleteHero(item.id)}>删除</button>
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

export default HeroManager;
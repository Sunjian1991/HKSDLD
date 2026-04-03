import { useState } from 'react';
import { exportData, importData } from '../utils/storage';
import { Equipment, Rune, Hero, Build, Category } from '../types';

interface DataSyncProps {
  data: {
    equipment: Equipment[];
    runes: Rune[];
    runeCategories: Category[];
    heroes: Hero[];
    heroCategories: Category[];
    builds: Build[];
  };
  onDataImport: (data: any) => void;
}

function DataSync({ data, onDataImport }: DataSyncProps) {
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = () => {
    const exportedData = exportData();
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lol-manager-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const importedData = importData(importText);
      onDataImport(importedData);
      setSuccess('数据导入成功！');
      setError('');
      setImportText('');
    } catch (err) {
      setError('数据导入失败，请检查文件格式是否正确。');
      setSuccess('');
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

  return (
    <div className="data-sync">
      <h2>数据同步</h2>
      <div className="data-stats">
        <div className="stat-item">
          <span className="stat-label">装备数量：</span>
          <span className="stat-value">{data.equipment.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">符文数量：</span>
          <span className="stat-value">{data.runes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">英雄数量：</span>
          <span className="stat-value">{data.heroes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">符文分类：</span>
          <span className="stat-value">{data.runeCategories.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">英雄分类：</span>
          <span className="stat-value">{data.heroCategories.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">流派数量：</span>
          <span className="stat-value">{data.builds.length}</span>
        </div>
      </div>
      
      {/* 导出数据 */}
      <div className="export-section">
        <h3>导出数据</h3>
        <p>点击下方按钮导出所有数据，包括装备、符文、英雄、分类和流派信息。</p>
        <button onClick={handleExport}>导出数据</button>
      </div>
      
      {/* 导入数据 */}
      <div className="import-section">
        <h3>导入数据</h3>
        <p>上传其他用户导出的数据包，或粘贴JSON格式的数据。</p>
        
        <div className="file-upload">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
          />
        </div>
        
        <textarea
          placeholder="粘贴JSON格式的数据..."
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={10}
        />
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button onClick={handleImport}>导入数据</button>
      </div>
    </div>
  );
}

export default DataSync;
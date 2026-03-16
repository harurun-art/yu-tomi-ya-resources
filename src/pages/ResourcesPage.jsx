import { useState, useEffect } from 'react'
import { Search, Archive, FileText, Image as ImageIcon, Layout, Box, Loader2, AlertCircle, Plus, X, Trash2 } from 'lucide-react'
import Papa from 'papaparse'

// CSV_URL for fetching data
const CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || '';
// GAS_URL for posting data
const GAS_URL = import.meta.env.VITE_GAS_API_URL || '';

const MOCK_DATA = [
  { id: 1, title: '令和6年度 班構成・役割分担表', type: 'Spreadsheet', category: '管理', url: '#', description: '今年度の班員リストと各係の分担まとめです。' },
  { id: 2, title: 'プロジェクト企画書テンプレート', type: 'Document', category: '企画', url: '#', description: '新規プロジェクトを立ち上げる際に使用するGoogleドキュメントのテンプレート。' },
  { id: 3, title: '新歓用チラシデザイン（完成版）', type: 'Canva', category: '広報', url: '#', description: 'Canvaで作成された最新のチラシデザイン。印刷用。' },
  { id: 4, title: 'マニュアル：GitHub Pagesでのサイト公開手順', type: 'PDF', category: '技術', url: '#', description: '非エンジニア向けにまとめたWebサイト公開のための手順書。' },
  { id: 5, title: 'ロゴ素材一式', type: 'Image', category: '広報', url: '#', description: '各種SNSや印刷物で使える班の公式ロゴデータまとめ。' }
];

const CATEGORIES = ['すべて', '管理', '企画', '広報', '技術'];
const RESOURCE_TYPES = ['ドキュメント', 'シート', 'Canva', 'PDF', '画像', 'その他'];

function getIconForType(type) {
  switch (String(type).toLowerCase()) {
    case 'document':
    case 'ドキュメント': return <FileText size={24} />;
    case 'spreadsheet':
    case 'シート': return <Layout size={24} />;
    case 'canva': return <Box size={24} color="#00C4CC" />;
    case 'pdf': return <FileText size={24} color="#F40F02" />;
    case 'image':
    case '画像': return <ImageIcon size={24} />;
    default: return <FileText size={24} />;
  }
}

function ResourcesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('すべて');

  // Add Resource Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ドキュメント',
    category: '管理',
    url: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    if (!CSV_URL) {
      console.log('CSV_URL is not set, using mock data.');
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    try {
      Papa.parse(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV Parsing Errors:', results.errors);
          }
          const parsedData = results.data.map((row, index) => ({
            id: index,
            title: row['資料タイトル'] || row.title || row['タイトル'] || '無題の資料',
            type: row['種類'] || row.type || 'Document',
            category: row['カテゴリ'] || row.category || 'その他',
            url: row['URL'] || row.url || '#',
            description: row['説明'] || row['説明（簡単にどんなものなのか）'] || row.description || ''
          }));
          setData(parsedData);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error fetching CSV:', error);
          setError('データの読み込みに失敗しました。');
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'すべて' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (!GAS_URL) {
      setSubmitError('GASのURLが設定されていません。環境変数 VITE_GAS_API_URL を確認してください。');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        // 'text/plain' is often needed for GAS CORS to prevent preflight if not fully configured
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        setIsModalOpen(false);
        setFormData({ title: '', type: 'ドキュメント', category: '管理', url: '', description: '' });
        // Refresh data
        fetchData();
      } else {
        setSubmitError(result.message || '追加に失敗しました。');
      }
    } catch (err) {
      setSubmitError('通信エラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, id, title) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!window.confirm(`「${title}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      return;
    }

    if (!GAS_URL) {
      alert('GASのURLが設定されていません。削除できません。');
      return;
    }

    setIsSubmitting(true);
    // In our CSV, data rows start at index 0, which corresponds to row 2 in the Spreadsheet (since row 1 is header).
    // So rowNumber = index + 2. The `id` we set is exactly the array index.
    const rowNumber = id + 2;

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', rowNumber })
      });

      const result = await response.json();

      if (result.status === 'success') {
        fetchData(); // Refresh the list
      } else {
        alert('削除に失敗しました: ' + (result.message || '不明なエラー'));
      }
    } catch (err) {
      alert('通信エラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="container">
          <div className="app-logo">
            <Archive size={28} />
            資料保管所
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              資料を追加
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">

          <section className="controls-section">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="資料を検索... (例: マニュアル, 議事録)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="category-filter">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`category-chip ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Error / Loading State */}
          {error && (
            <div className="empty-state" style={{ borderColor: 'red', color: 'red' }}>
              <AlertCircle size={48} style={{ margin: '0 auto' }} />
              <h3>エラーが発生しました</h3>
              <p>{error}</p>
            </div>
          )}

          {loading && !error && (
            <div className="empty-state">
              <Loader2 size={48} className="spin" style={{ margin: '0 auto', animation: 'spin 2s linear infinite' }} />
              <h3>データを読み込み中...</h3>
            </div>
          )}

          {/* Resource Grid */}
          {!loading && !error && (
            <section className="resource-grid">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="resource-card">
                    <div className="card-header">
                      <div className="card-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="card-icon">
                          {getIconForType(item.type)}
                        </div>
                        <span className="card-type">{item.type}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(e, item.id, item.title)}
                        title="この資料を削除"
                        disabled={isSubmitting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{item.title}</h3>
                      {item.description && <p className="card-description">{item.description}</p>}
                    </div>
                  </a>
                ))
              ) : (
                <div className="empty-state">
                  <Box size={48} color="var(--color-border)" style={{ margin: '0 auto' }} />
                  <h3>見つかりませんでした</h3>
                  <p>別のキーワードやカテゴリで検索してみてください。</p>
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              <X size={24} />
            </button>
            <h2 className="modal-title">新しい資料を追加</h2>

            {submitError && (
              <div style={{ color: 'red', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">資料タイトル <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例: 新歓用チラシデザイン（完成版）"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="url"
                  name="url"
                  required
                  className="form-input"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="例: https://docs.google.com/..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">資料の種類</label>
                  <select
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">カテゴリ</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {CATEGORIES.filter(c => c !== 'すべて').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">説明 (任意)</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="資料の簡単な説明を記載してください"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>キャンセル</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={20} className="spin" /> : <Plus size={20} />}
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple global style for spinner */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

export default ResourcesPage

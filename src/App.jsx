import { useState, useEffect } from 'react'
import { Search, Archive, FileText, Image as ImageIcon, Layout, Box, Loader2, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

// このURLをGoogleスプレッドシートの「ウェブに公開(CSV)」URLに置き換えます
const CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || '';

const MOCK_DATA = [
  { id: 1, title: '令和6年度 班構成・役割分担表', type: 'Spreadsheet', category: '管理', url: '#', description: '今年度の班員リストと各係の分担まとめです。' },
  { id: 2, title: 'プロジェクト企画書テンプレート', type: 'Document', category: '企画', url: '#', description: '新規プロジェクトを立ち上げる際に使用するGoogleドキュメントのテンプレート。' },
  { id: 3, title: '新歓用チラシデザイン（完成版）', type: 'Canva', category: '広報', url: '#', description: 'Canvaで作成された最新のチラシデザイン。印刷用。' },
  { id: 4, title: 'マニュアル：GitHub Pagesでのサイト公開手順', type: 'PDF', category: '技術', url: '#', description: '非エンジニア向けにまとめたWebサイト公開のための手順書。' },
  { id: 5, title: 'ロゴ素材一式', type: 'Image', category: '広報', url: '#', description: '各種SNSや印刷物で使える班の公式ロゴデータまとめ。' }
];

const CATEGORIES = ['すべて', '管理', '企画', '広報', '技術'];

function getIconForType(type) {
  switch (String(type).toLowerCase()) {
    case 'document': return <FileText size={24} />;
    case 'spreadsheet': return <Layout size={24} />;
    case 'canva': return <Box size={24} color="#00C4CC" />;
    case 'pdf': return <FileText size={24} color="#F40F02" />;
    case 'image': return <ImageIcon size={24} />;
    default: return <FileText size={24} />;
  }
}

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('すべて');

  useEffect(() => {
    async function fetchData() {
      if (!CSV_URL) {
        // 設定されていない場合はモックデータを表示してテストできるようにする
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
            // スプレッドシートの列名（title, type, category, url, description）をマッピング
            const parsedData = results.data.map((row, index) => ({
              id: index,
              title: row['資料タイトル'] || row.title || row['タイトル'] || '無題の資料',
              type: row['種類'] || row.type || 'Document',
              category: row['カテゴリ'] || row.category || 'その他',
              url: row['URL'] || row.url || '#',
              description: row['説明'] || row.description || ''
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
    }
    fetchData();
  }, []);

  // Filter logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'すべて' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <header className="app-header">
        <div className="container">
          <div className="app-logo">
            <Archive size={28} />
            資料保管所
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
                      <div className="card-icon">
                        {getIconForType(item.type)}
                      </div>
                      <span className="card-type">{item.type}</span>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{item.title}</h3>
                      <p className="card-description">{item.description}</p>
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

      {/* Simple global style for spinner */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

export default App

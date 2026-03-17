import React from 'react';
import { LayoutDashboard, Megaphone, Activity, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { sheetApi } from '../api/sheetApi';

const DEFAULT_ANNOUNCEMENTS = [];
const DEFAULT_ACTIVITIES = [];

function DashboardPage() {
  const [announcements, setAnnouncements] = React.useState(DEFAULT_ANNOUNCEMENTS);
  const [activities, setActivities] = React.useState(DEFAULT_ACTIVITIES);
  const [loading, setLoading] = React.useState(true);
  
  // For Modal
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newAnnouncement, setNewAnnouncement] = React.useState({ name: '', content: '', link: '' });
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annData, actData, memData] = await Promise.all([
        sheetApi.read('Announcements'),
        sheetApi.read('Activities'),
        sheetApi.read('Members')
      ]);
      
      setAnnouncements(annData.reverse()); // Show newest first
      setActivities(actData.reverse()); // Show newest first
      setMembers(memData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await sheetApi.add('Announcements', {
        name: newAnnouncement.name,
        content: newAnnouncement.content,
        url: newAnnouncement.link
      });
      
      // Auto-log activity
      await sheetApi.add('Activities', {
        name: newAnnouncement.name,
        action: '新しいお知らせを投稿しました'
      });
      
      setIsAddModalOpen(false);
      setNewAnnouncement({ name: '', content: '', link: '' });
      fetchData(); // Refresh data
    } catch (err) {
      alert('追加に失敗しました');
    }
  };

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <LayoutDashboard size={28} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Announcements Section */}
          <section className="dashboard-card" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>お知らせ</h2>
              </div>
              <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => setIsAddModalOpen(true)}>＋ 追加</button>
            </div>
            
            {loading ? <p>読み込み中...</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((ann, idx) => (
                  <li 
                    key={idx} 
                    style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                    onClick={() => setSelectedAnnouncement(ann)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>{ann['日付']}</span>
                    <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{ann['内容'] ? (ann['内容'].substring(0, 30) + (ann['内容'].length > 30 ? '...' : '')) : '無題'}</span>
                  </li>
                ))}
                {announcements.length === 0 && <p style={{color:'var(--color-text-light)', fontSize:'0.875rem'}}>お知らせはありません</p>}
              </ul>
            )}
          </section>

          {/* Recent Activity Section */}
          <section className="dashboard-card" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              <Activity size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>最近の活動</h2>
            </div>
            
            {loading ? <p>読み込み中...</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {activities.map((activity, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '50%' }}>
                      <Clock size={16} color="var(--color-text-light)" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500', fontSize: '0.875rem' }}>{activity['名前']} が {activity['内容'] || activity['action']}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{activity['日時'] || activity['時間']}</span>
                    </div>
                  </li>
                ))}
                {activities.length === 0 && <p style={{color:'var(--color-text-light)', fontSize:'0.875rem'}}>活動記録はありません</p>}
              </ul>
            )}
          </section>

          {/* Quick Links Section */}
          <section className="dashboard-card" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>クイックアクセス</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/resources" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                資料を探す <ArrowRight size={16} />
              </Link>
              <Link to="/progress" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                進捗を確認する <ArrowRight size={16} />
              </Link>
            </div>
          </section>

        </div>

        {/* Modals */}
        {selectedAnnouncement && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedAnnouncement(null)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>お知らせ詳細</h3>
              <p><strong>日付:</strong> {selectedAnnouncement['日付']}</p>
              <p><strong>投稿者:</strong> {selectedAnnouncement['名前']}</p>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', margin: '1rem 0', whiteSpace: 'pre-wrap' }}>
                {selectedAnnouncement['内容']}
              </div>
              {selectedAnnouncement['リンク'] && (
                <p><strong>リンク:</strong> <a href={selectedAnnouncement['リンク']} target="_blank" rel="noopener noreferrer">{selectedAnnouncement['リンク']}</a></p>
              )}
              <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setSelectedAnnouncement(null)}>閉じる</button>
            </div>
          </div>
        )}

        {isAddModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>お知らせを追加</h3>
              <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>投稿者</label>
                  <select 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newAnnouncement.name}
                    onChange={e => setNewAnnouncement({...newAnnouncement, name: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    {members.map((m, i) => (
                      <option key={i} value={m['名前（なまえ）'] || m['名前']}>{m['名前（なまえ）'] || m['名前']}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>内容</label>
                  <textarea 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '100px' }}
                    value={newAnnouncement.content}
                    onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>リンク（任意）</label>
                  <input 
                    type="url"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newAnnouncement.link}
                    onChange={e => setNewAnnouncement({...newAnnouncement, link: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>追加する</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default DashboardPage;

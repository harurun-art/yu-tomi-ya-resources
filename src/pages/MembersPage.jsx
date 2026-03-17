import React from 'react';
import { Users, Mail, Phone, Tag } from 'lucide-react';

import { sheetApi } from '../api/sheetApi';

const DEFAULT_MEMBERS = [
  { id: 1, name: 'テストユーザー', role: 'テスト担当', email: 'test@example.com', tags: ['テスト'] }
];

function MembersPage() {
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await sheetApi.read('Members');
        // GAS returns array of objects with keys from row 1.
        // Map them to our component's expected structure if they differ slightly.
        const mapped = data.map((row, index) => ({
          id: row.id !== undefined ? row.id : index,
          name: row['名前（なまえ）'] || row['名前'] || '名前未設定',
          email: row['メールアドレス'] || '',
          role: row['担当部署'] || '担当未設定',
          tags: (row['担当部署'] || '').split(',').map(s => s.trim()).filter(Boolean)
        }));
        setMembers(mapped.length > 0 ? mapped : DEFAULT_MEMBERS);
      } catch (err) {
        console.error(err);
        setError('メンバー情報の取得に失敗しました。GASの設定を確認してください。');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Users size={28} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>メンバー一覧</h1>
        </div>

        {loading && <div className="empty-state"><p>読み込み中...</p></div>}
        {error && <div className="empty-state" style={{color:'red'}}><p>{error}</p></div>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {members.map(member => (
            <div key={member.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '1.5rem', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{member.name}</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>{member.role}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
                  <Mail size={16} />
                  <a href={`mailto:${member.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{member.email}</a>
                </div>
                {/* Could add phone or other contacts here */}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                {member.tags.map(tag => (
                  <span key={tag} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    backgroundColor: '#f1f5f9', 
                    color: '#475569', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}

export default MembersPage;

import React from 'react';
import { Users, Mail, Phone, Tag } from 'lucide-react';

const MOCK_MEMBERS = [
  { id: 1, name: '山田 太郎', role: '班長・全体企画', email: 'yamada@example.com', tags: ['リーダー', '企画渉外'] },
  { id: 2, name: '佐藤 花子', role: '広報リーダー', email: 'sato@example.com', tags: ['SNS運用', 'デザイン'] },
  { id: 3, name: '鈴木 一郎', role: '技術サポート', email: 'suzuki@example.com', tags: ['Web担当', 'システム'] },
  { id: 4, name: '田中 美咲', role: 'イベント運営', email: 'tanaka@example.com', tags: ['当日進行', 'マニュアル作成'] },
  { id: 5, name: '高橋 健太', role: '会計・備品管理', email: 'takahashi@example.com', tags: ['予算', '備品調達'] },
];

function MembersPage() {
  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Users size={28} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>メンバー一覧</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {MOCK_MEMBERS.map(member => (
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
      </div>
    </main>
  );
}

export default MembersPage;

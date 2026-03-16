import React from 'react';
import { LayoutDashboard, Megaphone, Activity, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_ANNOUNCEMENTS = [
  { id: 1, date: '2026-03-15', title: '新年度の班構成が決定しました', type: 'info' },
  { id: 2, date: '2026-03-10', title: '新歓企画のブレスト会議について', type: 'meeting' },
  { id: 3, date: '2026-03-05', title: '新しい企画書テンプレートを公開しました', type: 'resource' },
];

const MOCK_RECENT_ACTIVITIES = [
  { id: 1, user: '山田', action: '「新歓用チラシデザイン」を追加しました', time: '2時間前' },
  { id: 2, user: '佐藤', action: '企画「春のイベント」の進捗を更新しました', time: '昨日' },
  { id: 3, user: '鈴木', action: 'スケジュールに「定例会議」を追加しました', time: '3日前' },
];

function DashboardPage() {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              <Megaphone size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>お知らせ</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {MOCK_ANNOUNCEMENTS.map(announcement => (
                <li key={announcement.id} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>{announcement.date}</span>
                  <span style={{ fontWeight: '500' }}>{announcement.title}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent Activity Section */}
          <section className="dashboard-card" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              <Activity size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>最近の活動</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {MOCK_RECENT_ACTIVITIES.map(activity => (
                <li key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '50%' }}>
                    <Clock size={16} color="var(--color-text-light)" />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{activity.user} が {activity.action}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
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
      </div>
    </main>
  );
}

export default DashboardPage;

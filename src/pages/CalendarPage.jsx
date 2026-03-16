import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

const MOCK_EVENTS = [
  { id: 1, title: '定例会議', date: new Date(2026, 2, 18, 19, 0), location: '部室', type: 'meeting' },
  { id: 2, title: '新歓ビラ配り', date: new Date(2026, 2, 20, 10, 0), location: 'キャンパス正門前', type: 'event' },
  { id: 3, title: '企画書提出締切', date: new Date(2026, 2, 25, 23, 59), location: 'オンライン', type: 'deadline' },
];

function CalendarPage() {
  const [currentDate] = useState(new Date(2026, 2, 16)); // Mocking current date to match metadata

  // A simple list view for upcoming events instead of a full grid calendar for now
  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={28} color="var(--color-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>スケジュール</h1>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> 予定追加
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '2rem' }}>
          
          {/* Upcoming Events List */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              今後の予定
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {MOCK_EVENTS.map(event => (
                <div key={event.id} style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  borderLeft: `4px solid ${event.type === 'meeting' ? '#3b82f6' : event.type === 'deadline' ? '#ef4444' : '#10b981'}`,
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-text-light)' }}>{format(event.date, 'MMM', { locale: ja })}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{format(event.date, 'd')}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{format(event.date, 'E', { locale: ja })}</span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{event.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} />
                        {format(event.date, 'HH:mm')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Calendar / Info Sidebar */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)', alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>今月の重点目標</h2>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li>新歓活動の準備を完了させる</li>
              <li>春のイベント企画書を通す</li>
              <li>全体会議の議事録をタイムリーに共有する</li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}

export default CalendarPage;

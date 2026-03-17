import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

import { sheetApi } from '../api/sheetApi';

const DEFAULT_EVENTS = [];
const DEFAULT_GOALS = [];

function CalendarPage() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({ title: '', datetime: '', location: '' });
  const [newGoal, setNewGoal] = useState({ content: '' });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, goalsData] = await Promise.all([
        sheetApi.read('Events'),
        sheetApi.read('Goals')
      ]);
      setEvents(eventsData);
      setGoals(goalsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await sheetApi.add('Events', {
        title: newEvent.title,
        datetime: newEvent.datetime,
        location: newEvent.location
      });
      setIsEventModalOpen(false);
      setNewEvent({ title: '', datetime: '', location: '' });
      fetchData();
    } catch (err) {
      alert('イベントの追加に失敗しました');
    }
  };

  const handleDeleteEvent = async (event, e) => {
    e.stopPropagation();
    if (!window.confirm(`予定「${event['タイトル']}」を削除しますか？`)) return;
    try {
      await sheetApi.delete('Events', event.id + 2);
      fetchData();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await sheetApi.add('Goals', {
        content: newGoal.content
      });
      setIsGoalModalOpen(false);
      setNewGoal({ content: '' });
      fetchData();
    } catch (err) {
      alert('目標の追加に失敗しました');
    }
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm('この目標を削除しますか？')) return;
    try {
      await sheetApi.delete('Goals', goal.id + 2);
      fetchData();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  // A simple list view for upcoming events instead of a full grid calendar for now
  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={28} color="var(--color-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>スケジュール</h1>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsEventModalOpen(true)}>
            <Plus size={16} /> 予定追加
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '2rem' }}>
          
          {/* Upcoming Events List */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', borderBottom: '2px solid var(--color-background)', paddingBottom: '0.5rem' }}>
              今後の予定
            </h2>
            {loading ? <p>読み込み中...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.map((event, idx) => {
                  const dateObj = new Date(event['日時']);
                  const isValidDate = !isNaN(dateObj.getTime());
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      gap: '1.5rem', 
                      padding: '1rem', 
                      borderRadius: '6px', 
                      borderLeft: `4px solid var(--color-primary)`,
                      backgroundColor: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                        {isValidDate ? (
                          <>
                            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-text-light)' }}>{format(dateObj, 'MMM', { locale: ja })}</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{format(dateObj, 'd')}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{format(dateObj, 'E', { locale: ja })}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>未定</span>
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{event['タイトル']}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} />
                            {isValidDate ? format(dateObj, 'HH:mm') : String(event['日時'] || '')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} />
                            {event['場所']}
                          </div>
                        </div>
                      </div>

                      {/* Delete Event Button */}
                      <div>
                        <button 
                          onClick={(e) => handleDeleteEvent(event, e)}
                          style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: '0.5rem' }}
                          title="予定を削除"
                        >×</button>
                      </div>

                    </div>
                  );
                })}
                {events.length === 0 && <p style={{color:'var(--color-text-light)', fontSize:'0.875rem'}}>今後の予定はありません</p>}
              </div>
            )}
          </div>

          {/* Mini Calendar / Info Sidebar */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>今月の重点目標</h2>
              <button onClick={() => setIsGoalModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Plus size={16} /> 追加
              </button>
            </div>
            
            {loading ? <p>読み込み中...</p> : (
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {goals.map((goal, idx) => (
                  <li key={idx} style={{ paddingRight: '2rem', position: 'relative' }}>
                    {goal['内容']}
                    <button 
                      onClick={() => handleDeleteGoal(goal)}
                      style={{ position: 'absolute', right: 0, top: '2px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                      title="目標を削除"
                    >×</button>
                  </li>
                ))}
                {goals.length === 0 && <span style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>目標は設定されていません</span>}
              </ul>
            )}
          </div>

        </div>

        {/* Modals */}
        {isEventModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsEventModalOpen(false)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>予定を追加</h3>
              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>タイトル</label>
                  <input type="text"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>日時</label>
                  <input type="datetime-local"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newEvent.datetime}
                    onChange={e => setNewEvent({...newEvent, datetime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>場所（任意）</label>
                  <input type="text"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEventModalOpen(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>追加する</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isGoalModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsGoalModalOpen(false)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>重点目標を追加</h3>
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>内容</label>
                  <input type="text"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newGoal.content}
                    onChange={e => setNewGoal({...newGoal, content: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsGoalModalOpen(false)}>キャンセル</button>
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

export default CalendarPage;

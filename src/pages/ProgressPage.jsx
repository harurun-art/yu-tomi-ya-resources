import React, { useState } from 'react';
import { CheckSquare, Plus, MoreHorizontal } from 'lucide-react';

import { sheetApi } from '../api/sheetApi';

const DEFAULT_TASKS = [];

function ProgressPage() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', title: '', team: '', deadline: '' });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, membersData] = await Promise.all([
        sheetApi.read('Tasks'),
        sheetApi.read('Members')
      ]);
      setTasks(tasksData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await sheetApi.add('Tasks', {
        name: newTask.name,
        title: newTask.title,
        team: newTask.team,
        deadline: newTask.deadline,
        status: 'todo'
      });
      
      await sheetApi.add('Activities', {
        name: newTask.name,
        action: `タスク「${newTask.title}」を追加しました`
      });

      setIsAddModalOpen(false);
      setNewTask({ name: '', title: '', team: '', deadline: '' });
      fetchData();
    } catch (err) {
      alert('追加に失敗しました');
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    // In a real robust system, we'd use the updateStatus GAS endpoint. 
    // Here we will use delete and then add as a simple workaround if updateStatus is not rock solid,
    // or just assume updateStatus works. Let's use updateStatus.
    // rowNumber in our GAS is index + 2 (because row 1 is header, index 0 is row 2)
    try {
      // Find column index for 'ステータス'. Assuming it's the 5th column. (名前, タスク名, 担当組, 期限, ステータス)
      const columnNumber = 5; 
      const rowNumber = task.id + 2; 

      await fetch('https://script.google.com/macros/s/AKfycbzPKN3S7QRy6zBV3U6PxJ6i4nJEPwXwu9CRMAlmiJdmeImd6Iat-Tl12peIeh5ve0Fy/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          sheetName: 'Tasks',
          rowNumber: rowNumber,
          columnNumber: columnNumber,
          value: newStatus
        })
      });

      if (newStatus === 'done') {
        await sheetApi.add('Activities', {
          name: task['名前'],
          action: `タスク「${task['タスク名']}」を完了しました`
        });
      }

      fetchData();
    } catch (err) {
      console.error(err);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`タスク「${task['タスク名']}」を削除しますか？`)) return;
    try {
      await sheetApi.delete('Tasks', task.id + 2);
      fetchData();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const todoTasks = tasks.filter(t => t['ステータス'] === 'todo' || !t['ステータス']);
  const inProgressTasks = tasks.filter(t => t['ステータス'] === 'in-progress');
  const doneTasks = tasks.filter(t => t['ステータス'] === 'done');

  const Column = ({ title, tasks, color }) => (
    <div style={{
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '1rem',
      minWidth: '280px',
      flex: 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
          {title} <span style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>({tasks.length})</span>
        </h2>
        <button className="btn btn-secondary" style={{ padding: '0.25rem', border: 'none', background: 'transparent' }}>
          <Plus size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map((task, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '6px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{task['タスク名']}</h3>
            {task['期限'] && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>期限: {task['期限']}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ 
                  backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500'
                }}>
                  {task['名前']}
                </div>
                {task['担当組'] && (
                  <div style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
                    {task['担当組']}
                  </div>
                )}
              </div>
              
              <div style={{ position: 'relative' }} className="task-actions">
                <select 
                  style={{ fontSize: '0.75rem', padding: '0.25rem', borderRadius: '4px', borderColor: 'var(--color-border)' }}
                  value={task['ステータス'] || 'todo'}
                  onChange={(e) => updateTaskStatus(task, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button 
                  onClick={() => handleDeleteTask(task)} 
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1rem' }}
                  title="削除"
                >×</button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-light)', fontSize: '0.875rem', border: '1px dashed var(--color-border)', borderRadius: '6px' }}>
            タスクはありません
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare size={28} color="var(--color-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>進捗状況</h1>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> タスク追加
          </button>
        </div>

        {loading ? <p>読み込み中...</p> : (
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            overflowX: 'auto', 
            paddingBottom: '1rem',
            minHeight: '60vh'
          }}>
            <Column title="未着手 (To Do)" tasks={todoTasks} color="#94a3b8" />
            <Column title="進行中 (In Progress)" tasks={inProgressTasks} color="#3b82f6" />
            <Column title="完了 (Done)" tasks={doneTasks} color="#10b981" />
          </div>
        )}

        {isAddModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>タスクを追加</h3>
              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>担当者（名前）</label>
                  <select 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newTask.name}
                    onChange={e => setNewTask({...newTask, name: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    {members.map((m, i) => (
                      <option key={i} value={m['名前（なまえ）'] || m['名前']}>{m['名前（なまえ）'] || m['名前']}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>タスク名</label>
                  <input type="text"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>担当部署</label>
                  <select
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newTask.team}
                    onChange={e => setNewTask({...newTask, team: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="受け入れチーム">受け入れチーム</option>
                    <option value="企画チーム">企画チーム</option>
                    <option value="広報チーム">広報チーム</option>
                    <option value="班リーダー・副リーダー">班リーダー・副リーダー</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>期限</label>
                  <input type="date"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newTask.deadline}
                    onChange={e => setNewTask({...newTask, deadline: e.target.value})}
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

export default ProgressPage;

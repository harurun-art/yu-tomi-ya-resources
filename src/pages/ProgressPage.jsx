import React, { useState } from 'react';
import { CheckSquare, Plus, MoreHorizontal } from 'lucide-react';

const INITIAL_TASKS = [
  { id: 1, title: '新歓用チラシデザイン作成', status: 'done', assignee: '佐藤' },
  { id: 2, title: '部室の備品リスト更新', status: 'in-progress', assignee: '高橋' },
  { id: 3, title: '春のイベント企画書ドラフト', status: 'todo', assignee: '山田' },
  { id: 4, title: 'Webサイトのドメイン更新', status: 'todo', assignee: '鈴木' },
  { id: 5, title: '過去資料のアーカイブ作業', status: 'in-progress', assignee: '田中' },
];

function ProgressPage() {
  const [tasks] = useState(INITIAL_TASKS);

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

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
        {tasks.map(task => (
          <div key={task.id} style={{
            backgroundColor: 'white',
            borderRadius: '6px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{task.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ 
                backgroundColor: '#e2e8f0', 
                color: '#475569', 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {task.assignee}
              </div>
              <MoreHorizontal size={16} color="var(--color-text-light)" />
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
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> タスク追加
          </button>
        </div>

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
      </div>
    </main>
  );
}

export default ProgressPage;

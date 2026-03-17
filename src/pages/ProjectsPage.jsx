import React, { useState, useEffect } from 'react';
import { Target, Plus, MoreHorizontal } from 'lucide-react';
import { sheetApi } from '../api/sheetApi';

const DEFAULT_PROJECTS = [];

function ProjectsPage() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', leader: '', description: '', status: 'planning' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, membersData] = await Promise.all([
        sheetApi.read('Projects'), // Requires a new 'Projects' sheet
        sheetApi.read('Members')
      ]);
      setProjects(projectsData.reverse()); // Newest first
      setMembers(membersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await sheetApi.add('Projects', {
        title: newProject.title,
        leader: newProject.leader,
        description: newProject.description,
        status: newProject.status
      });

      await sheetApi.add('Activities', {
        name: newProject.leader || 'システム',
        action: `新規企画「${newProject.title}」を立ち上げました`
      });

      setIsAddModalOpen(false);
      setNewProject({ title: '', leader: '', description: '', status: 'planning' });
      fetchData();
    } catch (err) {
      alert('追加に失敗しました。');
    }
  };

  const handleDeleteProject = async (project, e) => {
    e.stopPropagation();
    if (!window.confirm(`企画「${project['タイトル']}」を削除しますか？`)) return;
    try {
      await sheetApi.delete('Projects', project.id + 2);
      fetchData();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const updateProjectStatus = async (project, newStatus) => {
    try {
      await fetch('https://script.google.com/macros/s/AKfycbzPKN3S7QRy6zBV3U6PxJ6i4nJEPwXwu9CRMAlmiJdmeImd6Iat-Tl12peIeh5ve0Fy/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          sheetName: 'Projects',
          rowNumber: project.id + 2,
          columnNumber: 4, // 1: タイトル, 2: 責任者, 3: 概要, 4: ステータス
          value: newStatus
        })
      });

      await sheetApi.add('Activities', {
        name: project['責任者'] || 'システム',
        action: `企画「${project['タイトル']}」のステータスを更新しました`
      });

      fetchData();
    } catch (err) {
      console.error(err);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning': return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>企画中</span>;
      case 'executing': return <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>実行中</span>;
      case 'completed': return <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>完了</span>;
      default: return <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>未定</span>;
    }
  };

  return (
    <main className="main-content">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={28} color="var(--color-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>新規企画全体の進捗</h1>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> 企画を追加
          </button>
        </div>

        {loading ? <p>読み込み中...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.map((project, idx) => (
              <div key={idx} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{project['タイトル']}</h2>
                      {getStatusBadge(project['ステータス'] || 'planning')}
                    </div>
                    <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.875rem' }}>責任者: <strong>{project['責任者']}</strong></p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select 
                      style={{ fontSize: '0.875rem', padding: '0.4rem', borderRadius: '4px', borderColor: 'var(--color-border)' }}
                      value={project['ステータス'] || 'planning'}
                      onChange={(e) => updateProjectStatus(project, e.target.value)}
                    >
                      <option value="planning">企画中</option>
                      <option value="executing">実行中</option>
                      <option value="completed">完了</option>
                    </select>
                    <button 
                      onClick={(e) => handleDeleteProject(project, e)}
                      style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}
                      title="削除"
                    >×</button>
                  </div>
                </div>

                {project['概要'] && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {project['概要']}
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)', border: '2px dashed var(--color-border)', borderRadius: '8px' }}>
                現在、登録されている企画はありません。
              </div>
            )}
          </div>
        )}

        {/* Add Project Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>企画を追加</h3>
              <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>企画タイトル</label>
                  <input type="text"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>責任者</label>
                  <select 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newProject.leader}
                    onChange={e => setNewProject({...newProject, leader: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    {members.map((m, i) => (
                      <option key={i} value={m['名前（なまえ）'] || m['名前']}>{m['名前（なまえ）'] || m['名前']}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>ステータス</label>
                  <select 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    value={newProject.status}
                    onChange={e => setNewProject({...newProject, status: e.target.value})}
                  >
                    <option value="planning">企画中</option>
                    <option value="executing">実行中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>概要（任意）</label>
                  <textarea
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '100px' }}
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="企画の目的や現在の状況など"
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

export default ProjectsPage;

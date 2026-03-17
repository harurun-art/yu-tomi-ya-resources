import { NavLink } from 'react-router-dom';
import { Home, Archive, CheckSquare, Target, Calendar, Users, MessageCircle } from 'lucide-react';
import './Navigation.css';

function Navigation() {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/resources', icon: <Archive size={20} />, label: '資料アーカイブ' },
    { to: '/progress', icon: <CheckSquare size={20} />, label: 'タスク進捗' },
    { to: '/projects', icon: <Target size={20} />, label: '企画進捗' },
    { to: '/calendar', icon: <Calendar size={20} />, label: 'スケジュール' },
    { to: '/members', icon: <Users size={20} />, label: 'メンバー' },
    { to: '/assistant', icon: <MessageCircle size={20} />, label: 'AIアシスタント' },
  ];

  return (
    <nav className="main-nav">
      <div className="container nav-container">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink 
                to={item.to} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
              >
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;

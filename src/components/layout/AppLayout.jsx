import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, ArrowLeftRight, FileText, Lightbulb,
    User, LogOut, Menu, X, Bell, Settings, TrendingUp
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/statements', label: 'Statements', icon: FileText },
    { path: '/insights', label: 'AI Insights', icon: Lightbulb },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };
    const closeSidebar = () => setSidebarOpen(false);

    const getPageTitle = () => {
        const item = navItems.find(n => location.pathname === n.path);
        if (location.pathname === '/profile') return 'Profile';
        return item?.label || 'Dashboard';
    };

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

    return (
        <div className="app-layout">
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="sidebar-logo-brand">
                            <img src="https://raw.githubusercontent.com/GnandeepVenigalla/Mana_Karma/main/public/manakarma.png" alt="Mana Karma" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="sidebar-logo-text">Mana Karma</span>
                            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', opacity: 0.8, fontWeight: 500 }}>Powered by GD Enterprisier</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-label">Main Menu</span>
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <button
                            key={path}
                            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
                            onClick={() => { navigate(path); closeSidebar(); }}
                        >
                            <Icon className="nav-icon" size={18} />
                            {label}
                        </button>
                    ))}

                    <span className="nav-label" style={{ marginTop: 8 }}>Account</span>
                    <button
                        className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                        onClick={() => { navigate('/profile'); closeSidebar(); }}
                    >
                        <User className="nav-icon" size={18} />
                        Profile
                    </button>
                    <button className="nav-item" onClick={handleLogout}>
                        <LogOut className="nav-icon" size={18} />
                        Sign Out
                    </button>
                </nav>

                <div className="sidebar-user">
                    <div className="sidebar-user-card" onClick={() => { navigate('/profile'); closeSidebar(); }}>
                        <div className="user-avatar">{initials}</div>
                        <div>
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="main-content">
                <header className="topbar">
                    <div className="flex gap-12" style={{ alignItems: 'center' }}>
                        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <h1 className="topbar-title">{getPageTitle()}</h1>
                    </div>

                    <div className="topbar-actions">
                        {user?.income?.monthly > 0 && (
                            <div className="tag tag-blue" style={{ fontSize: 12.5 }}>
                                <TrendingUp size={12} style={{ marginRight: 4 }} />
                                ${(user.income.monthly).toLocaleString()}/mo
                            </div>
                        )}
                        <button className="topbar-btn">
                            <Bell size={16} />
                        </button>
                        <div
                            className="user-avatar"
                            style={{ cursor: 'pointer', width: 36, height: 36, fontSize: 13 }}
                            onClick={() => navigate('/profile')}
                        >
                            {initials}
                        </div>
                    </div>
                </header>

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, CreditCard, Users, BarChart3, LogOut, BookMarked, ImageIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid },
    { path: '/calendar', label: 'Calender', icon: Calendar },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/reports', label: 'Reports/Export', icon: BarChart3 },
    { path: '/subscriptions', label: 'Subscriptions', icon: BookMarked },
    { path: '/bridal-portfolio', label: 'Bridal Portfolio', icon: ImageIcon },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-[#E5E0D8] flex flex-col">
      {/* Logo */}
      <div className="p-6 mb-4">
        <img src="/icon.png" alt="Malaabis by Maymz" className="h-10 w-auto object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#F5F0E8] text-[#B8860B]'
                        : 'text-[#8B7355] hover:bg-[#E8E3DB] hover:text-[#B8860B]'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-[#8B7355] transition-all duration-200 hover:bg-[#E8E3DB] hover:text-[#B8860B]"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

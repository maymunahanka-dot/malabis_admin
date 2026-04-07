import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
     
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

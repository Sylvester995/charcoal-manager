import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import InstallPrompt from './InstallPrompt';
import Dashboard from '../dashboard/Dashboard';
import RecordBatch from '../batch/RecordBatch';
import RecordSales from '../sales/RecordSales';
import History from '../history/History';
import Projections from '../projections/Projections';
import Reinvestment from '../reinvestment/Reinvestment';
import Reports from '../reports/Reports';
import AdminPanel from '../admin/AdminPanel';
import MyAccount from '../account/MyAccount';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#0c0b09]">

      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/batch"       element={<RecordBatch />} />
            <Route path="/sales"       element={<RecordSales />} />
            <Route path="/history"     element={<History />}     />
            <Route path="/projections" element={<Projections />} />
            <Route path="/reinvestment" element={<Reinvestment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin"       element={<AdminPanel />}  />
            <Route path="/account"     element={<MyAccount />}   />
          </Routes>
        </main>
      </div>

       {/* Install prompt */}
           <InstallPrompt />

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>

    </div>
  );
};

export default Layout;
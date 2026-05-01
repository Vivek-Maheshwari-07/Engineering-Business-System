import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      
      {/* Dynamic Popups Mapped globally */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3500, 
          style: { 
            background: '#333', 
            color: '#fff', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px' 
          } 
        }} 
      />

      {/* Persistent generic navigation mapped safely inside flex layout bounds */}
      <Sidebar />

      {/* Main Container Scaling Viewport Object mapping */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Core Top-Level Identity Settings */}
        <Navbar />

        {/* Scrolling viewport rendering native children routes dynamically */}
        <main style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;

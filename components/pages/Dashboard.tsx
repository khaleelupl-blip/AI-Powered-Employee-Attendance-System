
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeDashboard from '../dashboards/EmployeeDashboard';
import ManagerDashboard from '../dashboards/ManagerDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';
import MainLayout from '../layout/MainLayout';
import Spinner from '../shared/Spinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    const syncData = () => {
      setSyncStatus('syncing');
      // Simulate API call for sync
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString());
      }, 1500);
    };

    syncData(); // Initial sync
    const interval = setInterval(syncData, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const renderDashboard = () => {
    if (!user) {
      return <div className="flex items-center justify-center h-full"><Spinner /></div>;
    }
    switch (user.role) {
      case 'employee':
        return <EmployeeDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return (
    <MainLayout syncStatus={syncStatus} lastSyncTime={lastSyncTime}>
      {renderDashboard()}
    </MainLayout>
  );
};

export default Dashboard;

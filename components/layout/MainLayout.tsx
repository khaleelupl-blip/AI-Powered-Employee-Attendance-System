
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  syncStatus: 'syncing' | 'synced' | 'error';
  lastSyncTime: string;
}

const SyncIndicator: React.FC<{ status: 'syncing' | 'synced' | 'error', time: string }> = ({ status, time }) => {
    const statusMap = {
        syncing: { icon: 'fa-spin fa-sync-alt', color: 'text-blue-500', text: 'Syncing...' },
        synced: { icon: 'fa-check-circle', color: 'text-green-500', text: `Synced at ${time}` },
        error: { icon: 'fa-exclamation-triangle', color: 'text-red-500', text: 'Sync Error' }
    };
    const { icon, color, text } = statusMap[status];

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-full py-2 px-4 flex items-center text-sm z-50 border dark:border-gray-700">
            <i className={`fas ${icon} ${color} mr-2`}></i>
            <span className="text-gray-600 dark:text-gray-300">{text}</span>
        </div>
    );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, syncStatus, lastSyncTime }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i className="fas fa-building text-2xl text-indigo-600 dark:text-indigo-400"></i>
              <span className="ml-3 font-bold text-xl text-gray-800 dark:text-white">AttendancePro</span>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-4">
                <p className="font-semibold text-gray-800 dark:text-white">{user?.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <SyncIndicator status={syncStatus} time={lastSyncTime} />
    </div>
  );
};

export default MainLayout;

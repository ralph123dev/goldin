import React, { useState } from 'react';
import { ArrowLeft, Users, MessageCircle, Shield } from 'lucide-react';
import Channel from './Channel';
import Chat from './Chat';
import Verify from './Verify';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState('channel');

  const tabs = [
    { id: 'channel', name: 'Channel', icon: Users, component: Channel },
    { id: 'chat', name: 'Chat', icon: MessageCircle, component: Chat },
    { id: 'verify', name: 'Verify', icon: Shield, component: Verify },
  ];

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (!activeTabData) return null;

    const Component = activeTabData.component;
    
    if (activeTab === 'chat') {
      return <Component userName={userName} />;
    }
    
    return <Component />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="bg-white shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onLogout}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-yellow-600">Gold Connect</h1>
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-50 text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white min-h-[calc(100vh-140px)] shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
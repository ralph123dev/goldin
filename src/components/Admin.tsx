import React, { useState, useEffect } from 'react';
import { Shield, Trash2, MessageCircle, Crown } from 'lucide-react';
import { subscribeToMessages, deleteMessage } from '../services/firebaseService';
import { Message } from '../types';

interface AdminProps {
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      setLoading(true);
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du message.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown size={32} />
                <div>
                  <h1 className="text-3xl font-bold">Administration</h1>
                  <p className="text-red-100">Gold Connect - Panel Admin</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-6">
              <MessageCircle className="text-red-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Messages ({messages.length})</h2>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aucun message à afficher</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {message.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{message.userName}</p>
                            <p className="text-sm text-gray-500">{message.country}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2 bg-white p-3 rounded border">
                          {message.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(message.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={loading}
                        className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
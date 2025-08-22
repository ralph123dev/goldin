import React, { useState, useEffect } from 'react';
import { Users, Globe } from 'lucide-react';
import { getUsers } from '../services/firebaseService';
import { User } from '../types';

const Channel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Users className="text-yellow-600 mr-2" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Global Chat</h2>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Aucun utilisateur connecté pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src={user.flag}
                      alt={`Drapeau de ${user.country}`}
                      className="w-5 h-4 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://flagsapi.com/XX/flat/32.png';
                      }}
                    />
                    <p className="text-sm text-gray-600">{user.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {user.joinedAt.toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.joinedAt.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Channel;
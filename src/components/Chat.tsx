import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { addMessage, subscribeToMessages } from '../services/firebaseService';
import { getUserCountryInfo } from '../services/locationService';
import { Message } from '../types';

interface ChatProps {
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUserCountry = async () => {
      try {
        const countryInfo = await getUserCountryInfo();
        setUserCountry(countryInfo.country);
      } catch (error) {
        console.error("Could not get user country", error);
        setUserCountry('Unknown');
      }
    };
    getUserCountry();

    const unsubscribe = subscribeToMessages((fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await addMessage(userName, newMessage.trim(), userCountry);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    // CHANGEMENT 1: h-full -> h-screen pour occuper toute la hauteur de l'écran.
    // Ajout de bg-transparent pour s'assurer que l'image de fond est visible partout.
    <div
      className="flex flex-col h-screen bg-transparent"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Empêche l'image de fond de défiler
      }}
    >
      {/* En-tête du chat (inchangé) */}
      <div className="flex-shrink-0 flex items-center p-4 border-b border-gray-200/50 bg-white/10 backdrop-blur-sm">
        <MessageCircle className="text-yellow-600 mr-2" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Chat Global</h2>
      </div>

      {/* CHANGEMENT 2: Suppression de max-h-96. flex-1 permet à cette div de prendre tout l'espace restant. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Aucun message pour le moment</p>
            <p className="text-gray-400 text-sm">Soyez le premier à écrire !</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userName === userName ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                  message.userName === userName
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {message.userName !== userName && (
                  <p className="text-xs font-semibold mb-1 text-yellow-600">
                    {message.userName} • {message.country}
                  </p>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={`text-xs text-right mt-1 ${
                    message.userName === userName
                      ? 'text-yellow-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Le formulaire est maintenant naturellement poussé en bas par la div flex-1 */}
      <form
        onSubmit={handleSendMessage}
        className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white/10 backdrop-blur-sm"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-2 rounded-full hover:from-yellow-600 hover:to-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
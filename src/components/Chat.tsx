import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Mic, Camera, X, Video, Image as ImageIcon } from 'lucide-react';

// Import de vos services
import { addTextMessage, addFileMessage, subscribeToMessages } from '../services/firebaseService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { getUserCountryInfo } from '../services/locationService';

// Import de vos types de données
import { Message } from '../types';

// --- Composant pour la Popup de sélection de Média ---
// Ce composant est autonome et gère la logique de sélection de fichiers.
const MediaPickerModal = ({ onClose, onFileSelect }: { onClose: () => void, onFileSelect: (file: File) => void }) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      // Validation de la durée de la vidéo avant de la traiter
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 180) { // Limite de 3 minutes
            alert("La vidéo ne doit pas dépasser 3 minutes.");
            if (event.target) event.target.value = ''; // Réinitialise l'input
          } else {
            onFileSelect(file);
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        onFileSelect(file);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative animate-fade-in-up">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
          <h3 className="text-lg font-bold mb-6">Partager un média</h3>
          <div className="space-y-4">
            <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center justify-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Video className="mr-3 text-red-500" /> Prendre une photo ou une vidéo
            </button>
            <button onClick={() => galleryInputRef.current?.click()} className="w-full flex items-center justify-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <ImageIcon className="mr-3 text-blue-500" /> Choisir depuis la galerie
            </button>
          </div>
          <input type="file" accept="image/*,video/*" capture="user" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
          <input type="file" accept="image/*,video/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    );
};


// --- Composant Principal du Chat ---
interface ChatProps {
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const countryInfo = await getUserCountryInfo();
        setUserCountry(countryInfo.country);
      } catch (error) {
        console.error("Impossible de récupérer le pays de l'utilisateur", error);
        setUserCountry('Inconnu');
      }
    };
    fetchUserCountry();
    const unsubscribe = subscribeToMessages(setMessages);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendTextMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await addTextMessage(userName, userCountry, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message texte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFile = async (file: File) => {
    setIsMediaModalOpen(false);
    setLoading(true);
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const fileURL = await uploadToCloudinary(file);
      await addFileMessage(userName, userCountry, fileType, fileURL);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier:', error);
      alert("L'envoi du fichier a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        setLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const fileURL = await uploadToCloudinary(audioBlob);
          await addFileMessage(userName, userCountry, 'audio', fileURL);
        } catch (error) {
          console.error("Erreur lors de l'envoi du message vocal:", error);
          alert("L'envoi du message vocal a échoué.");
        } finally {
          setLoading(false);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      alert("Impossible d'accéder au microphone. Veuillez vérifier les permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'image':
        if (typeof message.fileURL === 'string') {
          return <img src={message.fileURL} alt="Image envoyée" className="rounded-lg max-w-full h-auto" />;
        }
        break;
      case 'video':
        if (typeof message.fileURL === 'string') {
          return <video src={message.fileURL} controls className="rounded-lg max-w-full h-auto" />;
        }
        break;
      case 'audio':
        if (typeof message.fileURL === 'string') {
          return <audio src={message.fileURL} controls className="w-full" />;
        }
        break;
      case 'text':
        if (typeof message.content === 'string') {
          return <p className="text-sm break-words px-2">{message.content}</p>;
        }
        break;
    }
    return <p className="text-sm break-words px-2 text-red-400 italic">[Message illisible]</p>;
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-transparent" style={{ backgroundImage: 'url(/bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="flex-shrink-0 flex items-center p-4 border-b border-gray-200/50 bg-white/10 backdrop-blur-sm">
            <MessageCircle className="text-yellow-600 mr-2" size={24} />
            
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Aucun message pour le moment</p>
              <p className="text-gray-400 text-sm">Soyez le premier à écrire !</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.userName === userName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-2 rounded-lg shadow-md ${message.userName === userName ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' : 'bg-white border text-gray-800'}`}>
                  
                  {message.userName !== userName && (
                    <p className="text-xs font-semibold mb-1 text-yellow-600 px-2">
                      {typeof message.userName === 'string' ? message.userName : 'Utilisateur Inconnu'}
                      {typeof message.country === 'string' ? ` • ${message.country}` : ''}
                    </p>
                  )}
                  
                  <div className="p-1">{renderMessageContent(message)}</div>

                  <p className={`text-xs text-right mt-1 px-2 ${message.userName === userName ? 'text-yellow-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isRecording ? "Enregistrement en cours..." : "Entrez votre message..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500"
              disabled={loading || isRecording}
              onKeyDown={(e) => {if (e.key === 'Enter') handleSendTextMessage();}}
            />
            
            {newMessage.trim() ? (
              <button onClick={handleSendTextMessage} disabled={loading} className="p-3 rounded-full bg-yellow-600 text-white transition-transform hover:scale-110"><Send size={20} /></button>
            ) : (
              <>
                <button onClick={() => setIsMediaModalOpen(true)} disabled={loading || isRecording} className="p-3 rounded-full text-gray-600 hover:bg-gray-200"><Camera size={20} /></button>
                <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} className={`p-3 rounded-full text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-yellow-600'}`}><Mic size={20} /></button>
              </>
            )}
          </div>
        </div>
      </div>

      {isMediaModalOpen && <MediaPickerModal onClose={() => setIsMediaModalOpen(false)} onFileSelect={handleSendFile} />}
    </>
  );
};

export default Chat;
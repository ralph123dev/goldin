import React, { useState, useEffect } from 'react';
import { LogIn, X } from 'lucide-react'; // --- NOUVEAUTÉ ---: Ajout de l'icône X
import { addUser } from '../services/firebaseService';
import { getUserCountryInfo } from '../services/locationService';

import './Login.css';

interface LoginProps {
  onLogin: (name: string) => void;
}

interface Flower {
  id: number;
  style: React.CSSProperties;
}

// --- NOUVEAUTÉ ---: Création d'un composant pour la popup des termes et conditions
const TermsModal = ({ onClose }: { onClose: () => void }) => (
  // Le fond semi-transparent qui couvre toute la page
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    {/* Le conteneur de la popup */}
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
      {/* En-tête de la popup */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
  <h2 className="text-xl font-bold text-gray-800">Terms and Conditions</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          aria-label="Fermer la fenêtre modale"
        >
          <X size={24} />
        </button>
      </div>

      {/* Contenu des termes (avec défilement si nécessaire) */}
      <div className="p-6 overflow-y-auto space-y-4">
        <h3 className="font-semibold text-gray-700">1. Acceptance of Terms</h3>
        <p className="text-gray-600 text-sm">
          By accessing and using Gold Connect (the "Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of the terms, you may not access the Service.
        </p>

        <h3 className="font-semibold text-gray-700">2. Use of Service</h3>
        <p className="text-gray-600 text-sm">
          You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others, nor restrict or inhibit anyone else's use and enjoyment of the Service. Prohibited behaviors include harassment, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Service.
        </p>

        <h3 className="font-semibold text-gray-700">3. Data Privacy</h3>
        <p className="text-gray-600 text-sm">
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
        </p>

        <h3 className="font-semibold text-gray-700">4. Limitation of Liability</h3>
        <p className="text-gray-600 text-sm">
          The Service is provided "as is". Gold Connect does not warrant that the service will be uninterrupted, secure, or error-free. In no event shall Gold Connect be liable for any indirect, incidental, special, consequential, or punitive damages.
        </p>
      </div>

      {/* Pied de page de la popup */}
      <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <button
          onClick={onClose}
          className="bg-yellow-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
        >
          I understand
        </button>
      </div>
    </div>
  </div>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  
  // --- NOUVEAUTÉ ---: État pour contrôler la visibilité de la popup
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.length > name.length) {
      createFlower();
    }
    setName(newName);
  };

  const createFlower = () => {
    const newFlower: Flower = {
      id: Date.now() + Math.random(),
      style: {
        top: `${Math.random() * 60 - 20}%`,
        left: `${Math.random() * 100}%`,
      },
    };
    setFlowers((currentFlowers) => [...currentFlowers, newFlower]);
    setTimeout(() => {
      setFlowers((currentFlowers) =>
        currentFlowers.filter((f) => f.id !== newFlower.id)
      );
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter your username');
      return;
    }
    if (!acceptTerms) {
      setError('Accept the terms and conditions to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (name !== 'admin1234') {
        const countryInfo = await getUserCountryInfo();
        await addUser(name, countryInfo.country, countryInfo.flag);
      }
      onLogin(name);
    } catch (err) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/accueil.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md ${isMounted ? 'fade-in-on-load' : 'opacity-0'}`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Logo" className="h-12 mr-2" />
              <h1 className="text-3xl font-bold text-yellow-600">Gold Connect</h1>
            </div>
            <p className="text-gray-600">Sign in to your golden network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="name-input-container">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="Enter your name"
                disabled={loading}
              />
              {flowers.map((flower) => (
                <span key={flower.id} className="flower" style={flower.style}>
                  🌸
                </span>
              ))}
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                disabled={loading}
              />
              {/* --- NOUVEAUTÉ ---: Modification du label pour le rendre cliquable */}
              <label htmlFor="terms" className="text-sm text-gray-700">
                I accept the{' '}
                <button
                  type="button" // Important pour ne pas soumettre le formulaire
                  onClick={() => setIsTermsModalOpen(true)}
                  className="font-medium text-yellow-600 underline hover:text-yellow-700 focus:outline-none"
                >
                  terms and conditions
                </button>
                {' '}of Gold Connect
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-yellow-600 hover:to-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* --- NOUVEAUTÉ ---: Affichage conditionnel de la popup */}
      {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} />}
    </>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { addUser } from '../services/firebaseService';
import { getUserCountryInfo } from '../services/locationService';

// Importez le fichier CSS que vous venez de créer
import './Login.css';

interface LoginProps {
  onLogin: (name: string) => void;
}

// Interface pour définir la structure d'un objet fleur
interface Flower {
  id: number;
  style: React.CSSProperties;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- NOUVEAUTÉS ---
  // État pour l'animation de transition de la page
  const [isMounted, setIsMounted] = useState(false);
  // État pour gérer les fleurs animées
  const [flowers, setFlowers] = useState<Flower[]>([]);
  
  // Effet pour déclencher l'animation de transition au chargement
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;

    // Déclenche l'animation de fleur uniquement lors de l'ajout de caractères
    if (newName.length > name.length) {
      createFlower();
    }
    
    setName(newName);
  };

  // Fonction pour créer une nouvelle fleur animée
  const createFlower = () => {
    const newFlower: Flower = {
      id: Date.now() + Math.random(), // ID unique pour la clé
      style: {
        // Position aléatoire autour du champ de saisie
        top: `${Math.random() * 60 - 20}%`,
        left: `${Math.random() * 100}%`,
      },
    };

    // Ajoute la fleur à la liste
    setFlowers((currentFlowers) => [...currentFlowers, newFlower]);

    // Supprime la fleur après la fin de son animation (1500ms)
    setTimeout(() => {
      setFlowers((currentFlowers) =>
        currentFlowers.filter((f) => f.id !== newFlower.id)
      );
    }, 1500);
  };
  // --- FIN DES NOUVEAUTÉS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les termes et conditions');
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/accueil.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Ajout de la classe pour l'animation de fondu */}
      <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md ${isMounted ? 'fade-in-on-load' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-12 mr-2" />
            <h1 className="text-3xl font-bold text-yellow-600">Gold Connect</h1>
          </div>
          <p className="text-gray-600">Sign in to your golden network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Conteneur pour le champ de nom et les fleurs */}
          <div className="name-input-container">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange} // Utilise le nouveau gestionnaire
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="Enter your name"
              disabled={loading}
            />
            {/* Affichage des fleurs */}
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
            <label htmlFor="terms" className="text-sm text-gray-700">
              I accept the terms and conditions of Gold Connect
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
  );
};

export default Login;
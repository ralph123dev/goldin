import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, X } from 'lucide-react';
import { addVerifyData, getVerifyData, deleteVerifyData } from '../services/firebaseService';
import { VerifyData } from '../types';

const Verify: React.FC = () => {
  const [verifyDataList, setVerifyDataList] = useState<VerifyData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchVerifyData();
  }, []);

  const fetchVerifyData = async () => {
    try {
      const data = await getVerifyData();
      setVerifyDataList(data);
      
      // Toujours ouvrir le popup si aucune donnée n'existe
      if (data.length === 0) {
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, initialiser avec un tableau vide
      setVerifyDataList([]);
      setShowPopup(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim() || !formData.phoneNumber.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await addVerifyData(formData);
      setFormData({ name: '', country: '', phoneNumber: '' });
      setShowPopup(false);
      await fetchVerifyData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des données:', error);
      alert('Erreur lors de l\'ajout. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ces données ?')) {
      try {
        await deleteVerifyData(id);
        await fetchVerifyData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="text-yellow-600 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Vérification</h2>
        </div>
        <button
          onClick={() => setShowPopup(true)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-yellow-600 hover:to-yellow-700 transition-all"
        >
          <Plus size={20} />
          <span>Ajouter</span>
        </button>
      </div>

      {verifyDataList.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Aucune donnée de vérification</p>
          <p className="text-gray-400 text-sm">Cliquez sur "Ajouter" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifyDataList.map((data) => (
            <div
              key={data.id}
              className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">{data.name}</p>
                  <p className="text-sm text-gray-600">📍 {data.country}</p>
                  <p className="text-sm text-gray-600">📞 {data.phoneNumber}</p>
                </div>
                <button
                  onClick={() => handleDelete(data.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Données de Vérification</h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setFormData({ name: '', country: '', phoneNumber: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Votre nom complet"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Votre pays"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="+33 6 12 34 56 78"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setFormData({ name: '', country: '', phoneNumber: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
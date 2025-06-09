import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import FormationForm from './FormationForm';
import ModuleListByFormation from './ModuleListByFormation';
import Sidebar from "./Sidebar";

const API_BASE = import.meta.env.VITE_CATALOG_SERVICE_PORT;

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formationToDelete, setFormationToDelete] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getCookie('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Helper function to handle auth errors
  const handleAuthError = (response) => {
    if (response.status === 401) {
      // Handle unauthorized - clear token and show error
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    if (response.status === 403) {
      throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/Formation`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        handleAuthError(response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch formations');
        }
        
        const data = await response.json();
        setFormations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/Formation/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      handleAuthError(response);
      
      if (!response.ok) {
        throw new Error('Failed to delete formation');
      }
      
      setFormations(formations.filter(formation => formation.id !== id));
      setSuccessMessage('Formation supprimée avec succès !');
      setFormationToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formationData) => {
    try {
      const url = editingFormation 
        ? `${API_BASE}/api/Formation/${editingFormation.id}`
        : `${API_BASE}/api/Formation`;
      
      const method = editingFormation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formationData),
      });
      
      handleAuthError(response);
      
      if (!response.ok) {
        throw new Error('Failed to save formation');
      }
      
      const savedFormation = await response.json();
      
      if (editingFormation) {
        setFormations(formations.map(f => 
          f.id === savedFormation.id ? savedFormation : f
        ));
        setSuccessMessage('Formation mise à jour avec succès !');
      } else {
        setFormations([...formations, savedFormation]);
        setSuccessMessage('Formation ajoutée avec succès !');
      }
      
      setIsFormOpen(false);
      setEditingFormation(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (formation) => {
    setFormationToDelete(formation);
  };

  const cancelDelete = () => {
    setFormationToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BookOpenIcon className="h-8 w-8 mr-2 text-indigo-600" />
            Gestion des Formations
          </h1>
          <button
            onClick={() => {
              setEditingFormation(null);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Ajouter Formation
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Succès ! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {formationToDelete && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Confirmer la suppression</strong>
            <p className="mt-1">Êtes-vous sûr de vouloir supprimer la formation "{formationToDelete.title}" ?</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleDelete(formationToDelete.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Oui, Supprimer
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {selectedFormation ? (
          <ModuleListByFormation 
            formation={selectedFormation} 
            onBack={() => setSelectedFormation(null)}
          />
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crédits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formations.map((formation) => (
                    <tr key={formation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formation.title}</div>
                        <div className="text-sm text-gray-500">{formation.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formation.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formation.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedFormation(formation)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Voir Modules ({formation.modules?.length || 0})
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingFormation(formation);
                            setIsFormOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(formation)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <FormationForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingFormation(null);
          }}
          onSubmit={handleFormSubmit}
          formation={editingFormation}
        />
      </div>
    </div>
  );
};

export default FormationList;
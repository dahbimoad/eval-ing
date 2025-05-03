import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import FormationForm from './FormationForm';
import ModuleListByFormation from './ModuleListByFormation';

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Formation');
        
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
      const response = await fetch(`/api/Formation/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete formation');
      }
      
      setFormations(formations.filter(formation => formation.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formationData) => {
    try {
      const url = editingFormation 
        ? `/api/Formation/${editingFormation.id}`
        : '/api/Formation';
      
      const method = editingFormation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save formation');
      }
      
      const savedFormation = await response.json();
      
      if (editingFormation) {
        setFormations(formations.map(f => 
          f.id === savedFormation.id ? savedFormation : f
        ));
      } else {
        setFormations([...formations, savedFormation]);
      }
      
      setIsFormOpen(false);
      setEditingFormation(null);
    } catch (err) {
      setError(err.message);
    }
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
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-2 text-indigo-600" />
          Formations Management
        </h1>
        <button
          onClick={() => {
            setEditingFormation(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Formation
        </button>
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
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
                        View Modules ({formation.modules?.length || 0})
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
                        onClick={() => handleDelete(formation.id)}
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
  );
};

export default FormationList;
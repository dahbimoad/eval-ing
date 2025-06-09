import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ModuleForm from './ModuleForm';

const ModuleListByFormation = ({ formation, onBack }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/Module/formation/${formation.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        
        const data = await response.json();
        setModules(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchModules();
  }, [formation.id]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/Module/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
      
      setModules(modules.filter(module => module.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (moduleData) => {
    try {
      const url = editingModule 
        ? `/api/Module/${editingModule.id}`
        : '/api/Module';
      
      const method = editingModule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...moduleData,
          formationId: formation.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save module');
      }
      
      const savedModule = await response.json();
      
      if (editingModule) {
        setModules(modules.map(m => 
          m.id === savedModule.id ? savedModule : m
        ));
      } else {
        setModules([...modules, savedModule]);
      }
      
      setIsFormOpen(false);
      setEditingModule(null);
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
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Formations
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Modules for {formation.title}
        </h2>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingModule(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Module
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{module.title}</div>
                    <div className="text-sm text-gray-500">{module.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingModule(module);
                        setIsFormOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(module.id)}
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

      <ModuleForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingModule(null);
        }}
        onSubmit={handleFormSubmit}
        module={editingModule}
        formations={[formation]}
      />
    </div>
  );
};

export default ModuleListByFormation;
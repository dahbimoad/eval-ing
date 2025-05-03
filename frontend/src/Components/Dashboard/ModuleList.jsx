import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import ModuleForm from './ModuleForm';
import Sidebar from "./Sidebar";

const API_BASE = import.meta.env.VITE_CATALOG_SERVICE_PORT;

const ModuleList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formations, setFormations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesRes, formationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/Module`),
          fetch(`${API_BASE}/api/Formation`)
        ]);

        if (!modulesRes.ok || !formationsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const modulesData = await modulesRes.json();
        const formationsData = await formationsRes.json();

        setModules(modulesData);
        setFormations(formationsData);
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
      const response = await fetch(`${API_BASE}/api/Module/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete module');
      }

      setModules(modules.filter(module => module.id !== id));
      setSuccessMessage('Module deleted successfully!');
      setModuleToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (moduleData) => {
    try {
      const url = editingModule 
        ? `${API_BASE}/api/Module/${editingModule.id}`
        : `${API_BASE}/api/Module`;

      const method = editingModule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error('Failed to save module');
      }

      const savedModule = await response.json();

      if (editingModule) {
        setModules(modules.map(m => 
          m.id === savedModule.id ? savedModule : m
        ));
        setSuccessMessage('Module updated successfully!');
      } else {
        setModules([...modules, savedModule]);
        setSuccessMessage('Module added successfully!');
      }

      setIsFormOpen(false);
      setEditingModule(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (module) => {
    setModuleToDelete(module);
  };

  const cancelDelete = () => {
    setModuleToDelete(null);
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <AcademicCapIcon className="h-8 w-8 mr-2 text-indigo-600" />
            Modules Management
          </h1>
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

        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {moduleToDelete && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Confirm Delete</strong>
            <p className="mt-1">Are you sure you want to delete the module "{moduleToDelete.title}"?</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleDelete(moduleToDelete.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((module) => {
                  const formation = formations.find(f => f.id === module.formationId);
                  return (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{module.title}</div>
                        <div className="text-sm text-gray-500">{module.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formation ? formation.title : 'N/A'}
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
                          onClick={() => confirmDelete(module)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          formations={formations}
        />
      </div>
    </div>
  );
};

export default ModuleList;
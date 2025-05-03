'use client';
import React, { useState, useEffect } from "react";
import { FaTrash, FaUserEdit, FaPlus } from "react-icons/fa";
import Sidebar from "./Sidebar";

const TABLE_HEAD = ["Nom", "Prénom", "Module", "Email", "Modifier", "Supprimer"];
const API_BASE = import.meta.env.VITE_CATALOG_SERVICE_PORT;

const TABLE_ROWS = [
  { nom: "Oulad Maalem", prénom: "Ayoub", module: "GINF-2", email: "ouladmaalem.ayoub@etu.uae.ac.ma" },
  { nom: "Oulad Maalem", prénom: "Ayoub", module: "GINF-3", email: "ouladmaalem.ayoub@etu.uae.ac.ma" },
  { nom: "Oulad Maalem", prénom: "Ayoub", module: "GIL-2", email: "ouladmaalem.ayoub@etu.uae.ac.ma" },
];

function Enseignants() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState("");
  const [module, setModule] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modules, setModules] = useState([]); // Store full module objects
  const [loadingModules, setLoadingModules] = useState(true);
  const [errorModules, setErrorModules] = useState(null);

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        setErrorModules(null);
        
        console.log("Fetching modules from:", `${API_BASE}/api/Module`);
        const response = await fetch(`${API_BASE}/api/Module`);
        
        if (!response.ok) {
          console.error("Response not OK:", response.status, response.statusText);
          throw new Error(`Erreur lors du chargement des modules: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Modules data received:", data);
        
        if (!Array.isArray(data)) {
          console.error("Data is not an array:", data);
          throw new Error("Format de données invalide");
        }
        
        // Store the full module objects
        setModules(data);
        setLoadingModules(false);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setErrorModules(error.message);
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  const filteredRows = filter
    ? TABLE_ROWS.filter((student) => student.module === filter)
    : TABLE_ROWS;

  const handleFilterSelect = (option) => {
    setFilter(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="h-full w-full overflow-scroll px-6 py-24">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Gestion des Enseignants
        </h1>

        {/* Top Bar with Filter and Add */}
        <div className="flex justify-end items-center gap-4 mb-4">
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Filtrer par module
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                <ul className="py-1 text-sm text-gray-700">
                  {loadingModules ? (
                    <li className="px-4 py-2">Chargement...</li>
                  ) : errorModules ? (
                    <li className="px-4 py-2 text-red-500">{errorModules}</li>
                  ) : (
                    <>
                      {modules.map((mod) => (
                        <li
                          key={mod.id || mod._id}
                          onClick={() => handleFilterSelect(mod.title || mod.libelle)}
                          className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {mod.title || mod.libelle}
                        </li>
                      ))}
                      <li
                        onClick={() => handleFilterSelect("")}
                        className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        Tous
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaPlus />
          </button>
        </div>

        {/* Modal Ajout */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-gray-50 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative dark:bg-gray-700">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ajouter un enseignant
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-gray-400 hover:text-red-500 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4 grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">Nom</label>
                  <input type="text" className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white" placeholder="Entrez le nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">Prénom</label>
                  <input type="text" className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white" placeholder="Entrez le prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">Module</label>
                  <select 
                    value={module} 
                    onChange={(e) => setModule(e.target.value)} 
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">Sélectionner un module</option>
                    {loadingModules ? (
                      <option disabled>Chargement...</option>
                    ) : errorModules ? (
                      <option disabled>Erreur: {errorModules}</option>
                    ) : (
                      modules.map((mod) => (
                        <option key={mod.id || mod._id} value={mod.id || mod._id}>
                          {mod.code ? `${mod.code} - ${mod.title || mod.libelle}` : mod.title || mod.libelle}
                        </option>
                      ))
                    )}
                  </select>
                  {loadingModules && <p className="text-xs text-gray-500 mt-1">Chargement des modules...</p>}
                  {errorModules && <p className="text-xs text-red-500 mt-1">{errorModules}</p>}
                  {!loadingModules && !errorModules && modules.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Aucun module disponible</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
                  <input type="email" className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white" placeholder="email@example.com" />
                </div>
              </form>
              <div className="text-right">
                <button type="submit" className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500">Ajouter</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-center table-auto">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="px-6 py-3">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ nom, prénom, module, email }, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">{nom}</td>
                  <td className="px-6 py-4">{prénom}</td>
                  <td className="px-6 py-4">{module}</td>
                  <td className="px-6 py-4">{email}</td>
                  <td className="px-6 py-4 text-green-500">
                    <button onClick={() => {
                      setIsEditOpen(true);
                      setSelectedStudent({ nom, prénom, module, email });
                    }}>
                      <FaUserEdit />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-red-500">
                    <button onClick={() => alert("Delete action here")}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Enseignants;
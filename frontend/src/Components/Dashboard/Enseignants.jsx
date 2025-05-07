import React, { useState, useEffect } from "react";
import { FaTrash, FaUserEdit, FaPlus, FaCopy } from "react-icons/fa";
import { IoFilterOutline } from "react-icons/io5";
import Sidebar from "./Sidebar";

const TABLE_HEAD = ["Nom", "Prénom", "Module", "Email", "Modifier", "Supprimer"];

const TABLE_ROWS = [
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "GINF-2",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "GINF-3",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "GIL-2",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "GIL-3",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "GSEA-2",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "G2I-2",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
  {
    nom: "Oulad Maalem",
    prénom: "Ayoub",
    module: "Cyber-2",
    email: "ouladmaalem.ayoub@etu.uae.ac.ma",
  },
];

function Enseignants() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState(""); // State to track the selected filter
  const [module, setmodule] = useState(""); // State for module in modal forms
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown visibility

  const filteredRows = filter
    ? TABLE_ROWS.filter((student) => student.module === filter)
    : TABLE_ROWS;

  const moduleOptions = [
    "GINF-2",
    "GINF-3",
    "GIL-2",
    "GIL-3",
    "GSEA-2",
    "GSEA-3",
    "G2I-2",
    "G2I-3",
    "GSR-2",
    "Cyber-2",
    "Cyber-3",
  ];

  const handleFilterSelect = (option) => {
    setFilter(option);
    setIsDropdownOpen(false); // Close dropdown when an option is selected
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="h-full w-full overflow-scroll px-6 py-24">
        <h1 className="text-3xl space-x-8 font-semibold text-gray-900 dark:text-white">
          Gestion des Enseignants
        </h1>

        <div className="text-end mb-4 flex justify-end items-center gap-4">
          

          {/* Dropdown for filtering by module */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
              id="dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown visibility
            >
              Filtrer par module
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                  <ul className="py-1 text-sm text-gray-700">
                  {moduleOptions.map((option) => (
                    <li
                      key={option}
                      onClick={() => handleFilterSelect(option)}
                      className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {option}
                    </li>
                  ))}
                  <li
                    onClick={() => handleFilterSelect("")}
                    className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    Tous
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => setisAddOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaPlus />
          </button>
        </div>

        {isAddOpen && (
          <div className=" flex items-center justify-center bg-gray-50 bg-opacity-200">
            <div className="bg-gray-50 rounded-lg shadow-lg w-full p-6 relative dark:bg-gray-700">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ajouter un enseignant
                </h3>
                <button
                  onClick={() => setisAddOpen(false)}
                  className="text-gray-400 hover:text-red-500 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4 grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    module
                  </label>
                  <select
                    value={module}
                    onChange={(e) => setmodule(e.target.value)}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">Sélectionner un module</option>
                    {moduleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </form>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full table-auto text-center">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="border-b border-gray-300 pb-4 pt-10">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ nom, prénom, module, email }) => (
                <tr
                  key={nom}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                >
                  <td className="py-4">{nom}</td>
                  <td className="py-4">{prénom}</td>
                  <td className="py-4">{module}</td>
                  <td className="py-4">{email}</td>
                  <td className="py-4 text-green-400">
                    <button
                      onClick={() => {
                        setIsEditOpen(true);
                        setSelectedStudent({ nom, prénom, module, email });
                      }}
                    >
                      <div className="flex justify-center items-center">
                        <FaUserEdit />
                      </div>
                    </button>
                  </td>
                  <td className="py-4 text-red-400">
                    <button>
                      <div className="flex justify-center items-center">
                        <FaTrash />
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditOpen && (
          <div className="flex items-center justify-center fixed inset-0 z-50 bg-opacity-200 backdrop-blur-sm">
            <div className="bg-gray-50 rounded-lg shadow-lg w-full max-w-lg p-6 relative dark:bg-gray-700">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Modifier un enseignant
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-400 hover:text-red-500 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4 grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={selectedStudent?.nom || ""}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    value={selectedStudent?.prénom || ""}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    module
                  </label>
                  <select
                    value={module || selectedStudent?.module}
                    onChange={(e) => setmodule(e.target.value)}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                  >
                    <option value="">Sélectionner un module</option>
                    {moduleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={selectedStudent?.email || ""}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </form>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Enseignants;
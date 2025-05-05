import React, { useState, useEffect } from "react";
import { FaTrash, FaUserEdit, FaPlus, FaCopy } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../api/axiosInstance";

const TABLE_HEAD = ["Nom", "Prénom", "Module", "Email", "Statut", "Mot de passe par défaut", "Modifier", "Supprimer"];

const moduleOptions = [
  "Mathématiques", 
  "Physique", 
  "Informatique", 
  "Chimie", 
  "Biologie",
  "Français",
  "Anglais"
];

function Enseignants() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [filter, setFilter] = useState(""); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    module: ""
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/teachers');
      const data = response.data;
      setTeachers(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des enseignants:", error);
      toast.error("Erreur lors de la récupération des enseignants");
      setLoading(false);
    }
  };

  const filteredTeachers = filter
    ? teachers.filter((teacher) => teacher.module === filter)
    : teachers;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleModuleChange = (e) => {
    setFormData({
      ...formData,
      module: e.target.value
    });
  };

  const handleFilterSelect = (option) => {
    setFilter(option);
    setIsDropdownOpen(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Mot de passe copié dans le presse-papiers"))
      .catch(err => toast.error("Erreur lors de la copie du mot de passe"));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.module) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await api.post('/admin/teachers', formData);
      const data = response.data;
      setTeachers([...teachers, data.teacher]);
      setIsAddOpen(false);
      setFormData({ firstName: "", lastName: "", module: "" });
      toast.success("Enseignant ajouté avec succès");
      fetchTeachers(); // Rafraîchir la liste pour obtenir le mot de passe par défaut
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'ajout de l'enseignant");
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.module) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await api.put(`/admin/teachers/${selectedTeacher.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        module: formData.module,
        isActive: selectedTeacher.isActive
      });
      const updatedTeacher = response.data;
      setTeachers(teachers.map(teacher => 
        teacher.id === selectedTeacher.id ? updatedTeacher : teacher
      ));
      setIsEditOpen(false);
      toast.success("Enseignant mis à jour avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de l'enseignant");
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        setTeachers(teachers.filter(teacher => teacher.id !== id));
        toast.success("Enseignant supprimé avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression de l'enseignant");
      }
    }
  };

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      module: teacher.module
    });
    setIsEditOpen(true);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="h-full w-full overflow-scroll px-6 py-24">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
          Gestion des Enseignants
        </h1>

        <div className="text-end mb-4 flex justify-end items-center gap-4">
          {/* Dropdown for filtering by module */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
              id="dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
            onClick={() => {
              setFormData({ firstName: "", lastName: "", module: "" });
              setIsAddOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Ajouter
          </button>
        </div>

        {/* Table for teachers */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des enseignants...</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full table-auto text-center">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="border-b border-gray-300 pb-4 pt-10 px-4">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">{teacher.lastName}</td>
                      <td className="py-4 px-4">{teacher.firstName}</td>
                      <td className="py-4 px-4">{teacher.module}</td>
                      <td className="py-4 px-4">{teacher.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {teacher.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded mr-2">
                            {teacher.passwordDefault}
                          </span>
                          <button
                            onClick={() => copyToClipboard(teacher.passwordDefault)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copier le mot de passe"
                          >
                            <FaCopy size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEditClick(teacher)}
                          className="text-green-500 hover:text-green-700"
                          title="Modifier"
                        >
                          <div className="flex justify-center items-center">
                            <FaUserEdit size={18} />
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <div className="flex justify-center items-center">
                            <FaTrash size={18} />
                          </div>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={TABLE_HEAD.length} className="py-4 text-center text-gray-500">
                      Aucun enseignant trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Teacher Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
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

              <form onSubmit={handleAddTeacher} className="space-y-4 grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
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
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Module
                  </label>
                  <select
                    id="module"
                    value={formData.module}
                    onChange={handleModuleChange}
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
                    Email (généré automatiquement)
                  </label>
                  <input
                    type="text"
                    disabled
                    className="mt-1 block w-full border rounded-md p-2 bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                    value={formData.firstName && formData.lastName ? 
                      `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@prof.uae.ac.ma` : 
                      "prenom.nom@prof.uae.ac.ma"}
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative dark:bg-gray-700">
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

              <form onSubmit={handleUpdateTeacher} className="space-y-4 grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
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
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-600 dark:text-white"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Module
                  </label>
                  <select
                    id="module"
                    value={formData.module}
                    onChange={handleModuleChange}
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
                    type="text"
                    disabled
                    className="mt-1 block w-full border rounded-md p-2 bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                    value={selectedTeacher?.email || ""}
                  />
                </div>
                <div className="md:col-span-2 flex justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Mot de passe par défaut
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        className="border rounded-l-md p-2 dark:bg-gray-600 dark:text-white"
                        value={selectedTeacher?.passwordDefault || ""}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedTeacher?.passwordDefault)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                        title="Copier dans le presse-papiers"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 h-10 self-end"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Enseignants;
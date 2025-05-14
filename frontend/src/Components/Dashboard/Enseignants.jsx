import React, { useState, useEffect } from "react";
import { FaTrash, FaUserEdit, FaPlus, FaCopy } from "react-icons/fa";
import { IoFilterOutline } from "react-icons/io5";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [filter, setFilter] = useState(""); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherProfiles, setTeacherProfiles] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    module: ""
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/teachers');
      const data = response.data;
      
      // Fetch profile status for each teacher
      const profileStatuses = {};
      for (const teacher of data) {
        try {
          const profileResponse = await api.get(`/UserProfile/has-profile/${teacher.id}`);
          profileStatuses[teacher.id] = profileResponse.data.hasProfile;
        } catch (error) {
          console.error(`Erreur lors de la récupération du statut du profil pour l'enseignant ${teacher.id}:`, error);
          profileStatuses[teacher.id] = false;
        }
      }
      
      setTeachers(data);
      setTeacherProfiles(profileStatuses);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des enseignants:", error);
      toast.error("Erreur lors de la récupération des enseignants", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setLoading(false);
    }
  };

  const filteredTeachers = filter
    ? teachers.filter((teacher) => teacher.module === filter)
    : teachers;

  // Animation du toast pour copier le mot de passe
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Mot de passe copié", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          icon: "📋",
        });
      })
      .catch(err => {
        toast.error("Échec de la copie", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleModuleChange = (e) => {
    setFormData({ ...formData, module: e.target.value });
  };

  const handleFilterSelect = (option) => {
    setFilter(option);
    setIsDropdownOpen(false);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.module) {
      toast.error("Veuillez remplir tous les champs", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await api.post('/admin/teachers', formData);
      const newTeacher = response.data.teacher;
      
      // Fetch profile status for the new teacher
      try {
        const profileResponse = await api.get(`/UserProfile/has-profile/${newTeacher.id}`);
        setTeacherProfiles(prev => ({
          ...prev, 
          [newTeacher.id]: profileResponse.data.hasProfile
        }));
      } catch (error) {
        console.error(`Erreur lors de la récupération du statut du profil pour l'enseignant ${newTeacher.id}:`, error);
        setTeacherProfiles(prev => ({ ...prev, [newTeacher.id]: false }));
      }
      
      // Update teachers list
      setTeachers(prev => [...prev, newTeacher]);
      setIsAddOpen(false);
      setFormData({ firstName: "", lastName: "", module: "" });
      
      toast.success("Enseignant ajouté avec succès", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: "✅",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'ajout de l'enseignant", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

const handleUpdateTeacher = async (e) => {
  e.preventDefault();
  if (!formData.firstName || !formData.lastName || !formData.module) {
    toast.error("Veuillez remplir tous les champs", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return;
  }

  try {
    const response = await api.put(`/admin/teachers/${selectedTeacher.id}`, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      module: formData.module
    });

    const updatedTeacher = response.data;

    setTeachers(prev =>
      prev.map(teacher => teacher.id === selectedTeacher.id ? updatedTeacher : teacher)
    );

    setIsEditOpen(false);

    toast.success("Enseignant mis à jour avec succès", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: "🔄",
    });

    // Recharger la page
    window.location.reload();

  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Erreur lors de la mise à jour de l'enseignant", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
};


  const openDeleteModal = (teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTeacher = async () => {
    try {
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      
      // Animate removal
      setTeachers(prev => prev.filter(teacher => teacher.id !== teacherToDelete.id));
      setIsDeleteModalOpen(false);
      
      toast.success("Enseignant supprimé avec succès", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: "🗑️",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression de l'enseignant", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="h-full w-full overflow-auto p-6">
        <ToastContainer />
        
        <div className="max-w-7xl mx-auto">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              <span className="text-yellow-500">Gestion</span> des Enseignants
            </h1>
            
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <IoFilterOutline className="text-gray-500" />
                  <span>{filter || "Tous les modules"}</span>
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => handleFilterSelect("")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Tous les modules
                        </button>
                        {moduleOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleFilterSelect(option)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Add Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ firstName: "", lastName: "", module: "" });
                  setIsAddOpen(true);
                }}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all shadow-md"
              >
                <FaPlus size={12} />
                <span>Ajouter</span>
              </motion.button>
            </div>
          </div>
          
          {/* Table Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-16 h-16 border-t-4 border-yellow-500 border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des enseignants...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Prénom</th>
                      <th className="px-6 py-4">Module</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Mot de passe</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <motion.tr
                          key={teacher.id}
                          variants={rowVariants}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {teacher.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {teacher.firstName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {teacher.module}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <motion.div
                                initial={false}
                                animate={{
                                  backgroundColor: teacherProfiles[teacher.id] ? "#10B981" : "#EF4444",
                                }}
                                transition={{ duration: 0.3 }}
                                className="w-3 h-3 rounded-full mr-2"
                              ></motion.div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  teacherProfiles[teacher.id]
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {teacherProfiles[teacher.id] ? "Activé" : "Non activé"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                                {teacher.passwordDefault}
                              </code>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => copyToClipboard(teacher.passwordDefault)}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                                title="Copier le mot de passe"
                              >
                                <FaCopy size={14} />
                              </motion.button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditClick(teacher)}
                                className="p-1.5 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                title="Modifier"
                              >
                                <FaUserEdit size={16} />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openDeleteModal(teacher)}
                                className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                title="Supprimer"
                              >
                                <FaTrash size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          Aucun enseignant trouvé
                        </td>
                      </tr>
                    )}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Add Teacher Modal */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaPlus className="mr-2 text-yellow-500" size={16} />
                    Ajouter un enseignant
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAddOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </motion.button>
                </div>

                <form onSubmit={handleAddTeacher} className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Module
                      </label>
                      <select
                        id="module"
                        value={formData.module}
                        onChange={handleModuleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email (généré automatiquement)
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        value={formData.firstName && formData.lastName ? 
                          `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@prof.uae.ac.ma` : 
                          "prenom.nom@prof.uae.ac.ma"}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Ajouter
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Edit Teacher Modal */}
        <AnimatePresence>
          {isEditOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaUserEdit className="mr-2 text-yellow-500" size={16} />
                    Modifier un enseignant
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </motion.button>
                </div>

                <form onSubmit={handleUpdateTeacher} className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module</label>
                      <select
                        id="module"
                        value={formData.module}
                        onChange={handleModuleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Sélectionner un module</option>
                        {moduleOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        value={selectedTeacher?.email || ""}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Mettre à jour
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Supprimer l'enseignant
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Êtes-vous sûr de vouloir supprimer {teacherToDelete?.firstName} {teacherToDelete?.lastName} ? Cette action est irréversible.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleDeleteTeacher}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Enseignants;

// src/Components/Dashboard/Templates.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaPlus, FaTrash, FaArrowRight, FaSearch, FaFilter, FaCopy, FaEye, FaRocket, FaCode, FaCogs, FaGraduationCap } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./Sidebar";
import { useTemplates } from "../../hooks/useTemplates";
import { useFilieres } from "../../hooks/useFilieres";
import { publicationService } from "../../services/publicationService";

export default function Templates() {
  /* ─── template hook ─── */
  const {
    templates,
    loading: tplLoading,
    loadTemplates,
    addTemplate,
    removeTemplate
  } = useTemplates();

  /* ─── filière hook ─── */
  const {
    filieres,
    loading: filLoading
  } = useFilieres();

  /* ─── local state ─── */
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [publications, setPublications] = useState([]);
  const [form, setForm] = useState({
    templateCode: "",
    filiereId: "",
    role: "Professor",
    title: ""
  });

  /* ─── initial load ─── */
  useEffect(() => {
    loadTemplates();
    loadPublications();
  }, [loadTemplates]);

  const loadPublications = async () => {
    try {
      const response = await publicationService.getAll();
      
      // Handle different response structures
      let publicationsData = [];
      if (Array.isArray(response.data)) {
        publicationsData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        publicationsData = response.data.items;
      } else if (response.data && Array.isArray(response.data.publications)) {
        publicationsData = response.data.publications;
      }
      
      console.log('🔧 Publications loaded in Templates:', publicationsData); // Debug log
      setPublications(publicationsData);
    } catch (error) {
      console.error("Error loading publications:", error);
      setPublications([]);
    }
  };

  /* ─── handlers ─── */
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('🔧 Form data:', form);
    console.log('🔧 Available filieres:', filieresList);
    console.log('🔧 Selected filiereId:', form.filiereId, typeof form.filiereId);
    
    // Validate filière selection
    if (!form.filiereId || form.filiereId === "") {
      toast.error("Veuillez sélectionner une filière");
      return;
    }
    
    // payload shape expected by API:
    const payload = {
      templateCode: form.templateCode.trim(),
      filiereId: Number(form.filiereId),
      role: form.role,
      title: form.title.trim()
    };
    
    console.log('🔧 Final payload:', payload);
    
    // Additional validation
    if (!payload.templateCode) {
      toast.error("Le code du template est obligatoire");
      return;
    }
    if (!payload.title) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (isNaN(payload.filiereId) || payload.filiereId <= 0) {
      toast.error("Filière invalide - Debug: " + JSON.stringify({
        original: form.filiereId,
        converted: payload.filiereId,
        isNaN: isNaN(payload.filiereId),
        isLessOrEqual0: payload.filiereId <= 0
      }));
      return;
    }
    
    console.log('🔧 Creating template with payload:', payload); // Debug log
    
    const ok = await addTemplate(payload);
    if (ok !== false) {
      setShowNew(false);
      setForm({ templateCode: "", filiereId: "", role: "Professor", title: "" });
      toast.success("Template créé avec succès!");
    }
  };

  const handleDuplicate = async (template) => {
    const newCode = `${template.templateCode}_copy_${Date.now()}`;
    const payload = {
      templateCode: newCode,
      filiereId: template.filiereId,
      role: template.role,
      title: `${template.title} (Copie)`
    };
    await addTemplate(payload);
  };

  // Filter templates - ensure templates is always an array
  const templatesList = Array.isArray(templates) ? templates : [];
  const filteredTemplates = templatesList.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tpl.templateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tpl.status === filterStatus;
    const matchesRole = filterRole === "all" || tpl.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get publication info for a template
  const getPublicationInfo = (templateCode) => {
    return publications.find(pub => pub.templateCode === templateCode);
  };

  // Ensure filieres is always an array
  const filieresList = Array.isArray(filieres) ? filieres : [];
  const list = Array.isArray(filteredTemplates) ? filteredTemplates : [];

  const getRoleInfo = (role) => {
    switch (role) {
      case "Étudiant":
        return { color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300", icon: <FaGraduationCap /> };
      case "Enseignant":
        return { color: "bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border-green-300", icon: <FaCogs /> };
      case "Professionnel":
        return { color: "bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 border-purple-300", icon: <FaRocket /> };
      default:
        return { color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300", icon: <FaCode /> };
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "Published":
        return { color: "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border-emerald-300", text: "Publié" };
      case "Draft":
        return { color: "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border-amber-300", text: "Brouillon" };
      default:
        return { color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300", text: status };
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-lg border border-indigo-200 dark:border-gray-600 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gestion des Questionnaires
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Créez et gérez vos templates de questionnaires d'évaluation
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNew(true)}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaPlus size={18} /> Nouveau Template
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou code..."
                  className="w-full pl-14 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="Draft">Brouillon</option>
                <option value="Published">Publié</option>
              </select>

              <select
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="Étudiant">Étudiant</option>
                <option value="Enseignant">Enseignant</option>
                <option value="Professionnel">Professionnel</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Templates List */}
        <AnimatePresence>
          {tplLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Chargement des templates...</p>
              </div>
            </motion.div>
          ) : list.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl shadow-lg text-center border border-gray-200 dark:border-gray-700"
            >
              <div className="text-gray-400 text-8xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Aucun template trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                {templatesList.length === 0 
                  ? "Commencez par créer votre premier template de questionnaire."
                  : "Aucun template ne correspond à vos critères de recherche."
                }
              </p>
              {templatesList.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                >
                  <FaPlus />
                  Créer un template
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {list.map((tpl, index) => {
                const roleInfo = getRoleInfo(tpl.role);
                const statusInfo = getStatusInfo(tpl.status);
                const publicationInfo = getPublicationInfo(tpl.templateCode);
                const filiere = filieresList.find(f => f.id === tpl.filiereId);

                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 line-clamp-2">
                            {tpl.title}
                          </h3>
                          <p className="text-indigo-100 text-sm opacity-90">
                            Code: {tpl.templateCode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${roleInfo.color}`}>
                            {roleInfo.icon}
                            {tpl.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Status and Formation */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          {filiere && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {filiere.title}
                            </span>
                          )}
                        </div>

                        {/* Publication Status */}
                        {publicationInfo && (
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                              ✅ Publié
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Link
                              to={`/admin/questionnaire/${tpl.id}/edit`}
                              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              <FaEye />
                              Éditer
                            </Link>
                          </motion.div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDuplicate(tpl)}
                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Dupliquer ce template"
                          >
                            <FaCopy />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeTemplate(tpl.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Supprimer ce template"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create New Template Modal */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNew(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
                  <h2 className="text-2xl font-bold text-white">Nouveau Template</h2>
                  <p className="text-indigo-100 mt-1">Créez un nouveau questionnaire d'évaluation</p>
                </div>
                
                <form onSubmit={handleCreate} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Code du Template *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300"
                      placeholder="ex: EVAL-2024-001"
                      value={form.templateCode}
                      onChange={(e) => setForm({...form, templateCode: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300"
                      placeholder="Titre du questionnaire"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Filière *
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
                      value={form.filiereId}
                      onChange={(e) => setForm({...form, filiereId: e.target.value})}
                      required
                    >
                      <option value="">Sélectionnez une filière</option>
                      {filieresList.map(fil => (
                        <option key={fil.id} value={fil.id}>
                          {fil.title} ({fil.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Rôle cible *
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
                      value={form.role}
                      onChange={(e) => setForm({...form, role: e.target.value})}
                    >
                      <option value="Étudiant">Étudiant</option>
                      <option value="Enseignant">Enseignant</option>
                      <option value="Professionnel">Professionnel</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowNew(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <FaPlus />
                      Créer
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

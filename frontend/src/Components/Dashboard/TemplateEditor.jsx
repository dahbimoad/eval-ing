// src/Components/Dashboard/TemplateEditor.jsx
import React, { useEffect, useState }  from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion }                      from "framer-motion";
import { ToastContainer, toast }       from "react-toastify";

import Sidebar                         from "./Sidebar";
import { useTemplates }                from "../../hooks/useTemplates";
import {
  createSection,
  updateSection,
  deleteSection   as apiDeleteSection,
  createQuestion,
  updateQuestion,
  deleteQuestion  as apiDeleteQuestion,
  getSections
} from "../../services/templateService";
import { publicationService } from "../../services/publicationService";

/* ------------------------------------------------------------------ */

export default function TemplateEditor() {
  const { id }  = useParams();            // template ID from URL
  const nav     = useNavigate();

  /* main hook -------------------------------------------------------- */
  const {
    templates,
    loadTemplates,
  } = useTemplates();

  /* local state ------------------------------------------------------ */
  const [tpl,       setTpl]       = useState(null);    // template object
  const [sections,  setSections]  = useState([]);      // list of sections
  const [newTitle,  setNewTitle]  = useState("");      // new section title
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({
    startDate: "",
    endDate: "",
    description: ""
  });

  /* initial data ----------------------------------------------------- */
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /* whenever list of templates changes, grab this one */
  useEffect(() => {
    const current = templates.find(t => t.id === +id);
    setTpl(current || null);
  }, [templates, id]);

  /* whenever template is resolved, fetch its sections */
  useEffect(() => {
    if (!tpl) return;
    (async () => {
      try {
        const { data } = await getSections(tpl.id);
        setSections(data);
      } catch {
        toast.error("Impossible de charger les sections");
      }
    })();
  }, [tpl]);

  /* helpers ---------------------------------------------------------- */
  const addSection = async () => {
    if (!newTitle.trim() || !tpl) return;

    const payload = { title: newTitle, displayOrder: sections.length + 1 };

    await createSection(tpl.id, payload)
      .then(() => getSections(tpl.id).then(res => setSections(res.data)))
      .catch(() => toast.error("Ajout de section impossible"));

    setNewTitle("");
  };

  const removeSection = async (sectionId) => {
    if (!tpl) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette section et toutes ses questions ?")) return;

    await apiDeleteSection(tpl.id, sectionId)
      .then(() => setSections(sections.filter(s => s.id !== sectionId)))
      .catch(() => toast.error("Suppression impossible"));
  };

  const updateSectionOrder = async (sectionId, direction) => {
    const index = sections.findIndex(s => s.id === sectionId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update display orders
    newSections.forEach((section, idx) => {
      section.displayOrder = idx + 1;
    });
    
    setSections(newSections);
    
    // Update in backend
    try {
      await updateSection(tpl.id, sectionId, { displayOrder: newSections[index].displayOrder });
      await updateSection(tpl.id, newSections[targetIndex].id, { displayOrder: newSections[targetIndex].displayOrder });
    } catch {
      toast.error("Erreur lors de la mise à jour de l'ordre");
    }
  };

  const addQuestion = async (sectionId, q) => {
    if (!tpl) return;
    await createQuestion(tpl.id, sectionId, q)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Ajout de question impossible"));
  };

  const removeQuestion = async (sectionId, qId) => {
    if (!tpl) return;
    await apiDeleteQuestion(tpl.id, sectionId, qId)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Suppression impossible"));
  };

  const refreshSection = async (sectionId) => {
    const { data } = await getSections(tpl.id);            // quickest: reload all
    setSections(data);
  };

  const handlePublish = async () => {
    if (!publishForm.startDate || !publishForm.endDate) {
      toast.error("Veuillez remplir les dates de début et de fin");
      return;
    }

    try {
              await publicationService.publish(tpl.id, publishForm);
      toast.success("Questionnaire publié avec succès !");
      setShowPublishModal(false);
      nav("/admin/questionnaire");
    } catch (error) {
      toast.error("Erreur lors de la publication");
    }
  };

  const validateTemplate = () => {
    if (sections.length === 0) {
      toast.error("Le questionnaire doit contenir au moins une section");
      return false;
    }
    
    const hasEmptySections = sections.some(s => !s.questions || s.questions.length === 0);
    if (hasEmptySections) {
      toast.error("Toutes les sections doivent contenir au moins une question");
      return false;
    }
    
    return true;
  };

  /* render ----------------------------------------------------------- */
  if (!tpl) return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6">
        <p>Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* title + publish btn --------------------------------------- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tpl.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Code: {tpl.templateCode} | Filière: {tpl.filiereId} | Rôle: {tpl.role}
              </p>
            </div>

            {tpl.status === "Draft" && (
              <motion.button
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (validateTemplate()) {
                    setShowPublishModal(true);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
              >
                Publier le questionnaire
              </motion.button>
            )}
            
            {tpl.status === "Published" && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                ✓ Publié
              </span>
            )}
          </div>
        </div>

        {/* sections summary ------------------------------------------ */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>{sections.length}</strong> section(s) • 
            <strong> {sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0)}</strong> question(s) au total
          </p>
        </div>

        {/* all sections ---------------------------------------------- */}
        {sections.map((sec, index) => (
          <SectionCard
            key={sec.id}
            section={sec}
            index={index}
            totalSections={sections.length}
            onDelete={() => removeSection(sec.id)}
            onUpdateOrder={(direction) => updateSectionOrder(sec.id, direction)}
            onAddQuestion={payload => addQuestion(sec.id, payload)}
            onDeleteQuestion={qId => removeQuestion(sec.id, qId)}
            templateId={tpl.id}
          />
        ))}

        {/* add section  --------------------------------------------- */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Ajouter une nouvelle section</h3>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Titre de la nouvelle section"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addSection()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addSection}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlus/> Ajouter
            </motion.button>
          </div>
        </div>

        {/* Publish Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-full">
              <h2 className="text-xl font-bold mb-4">Publier le questionnaire</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={publishForm.startDate}
                    onChange={(e) => setPublishForm({...publishForm, startDate: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={publishForm.endDate}
                    onChange={(e) => setPublishForm({...publishForm, endDate: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optionnelle)</label>
                  <textarea
                    className="input w-full"
                    rows="3"
                    placeholder="Description de la publication..."
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({...publishForm, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Publier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* helper component – a single section + its questions                */
function SectionCard({ section, index, totalSections, onDelete, onUpdateOrder, onAddQuestion, onDeleteQuestion, templateId }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [editingSection, setEditingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title);
  const [qForm,   setQForm]     = useState({ 
    wording: "", 
    type: "Likert",
    isRequired: true,
    displayOrder: (section.questions?.length || 0) + 1
  });

  const submitQ = async () => {
    if (!qForm.wording.trim()) return;
    await onAddQuestion(qForm);
    setQForm({ 
      wording: "", 
      type: "Likert",
      isRequired: true,
      displayOrder: (section.questions?.length || 0) + 2
    });
    setShowAdd(false);
  };

  const handleUpdateSection = async () => {
    if (!sectionTitle.trim()) return;
    try {
      await updateSection(templateId, section.id, { title: sectionTitle });
      section.title = sectionTitle;
      setEditingSection(false);
      toast.success("Section mise à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4"
    >
      {/* header ------------------------------------------------------ */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-gray-500">Section {index + 1}</span>
          {editingSection ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                className="input flex-1"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateSection()}
              />
              <button onClick={handleUpdateSection} className="text-green-600" title="Sauvegarder">
                <FaSave />
              </button>
              <button onClick={() => {
                setSectionTitle(section.title);
                setEditingSection(false);
              }} className="text-gray-500" title="Annuler">
                <FaTimes />
              </button>
            </div>
          ) : (
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {section.title}
              <button onClick={() => setEditingSection(true)} className="text-blue-500" title="Modifier">
                <FaEdit size={14} />
              </button>
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button onClick={() => onUpdateOrder('up')} className="text-gray-500 hover:text-gray-700" title="Monter">
              <FaArrowUp />
            </button>
          )}
          {index < totalSections - 1 && (
            <button onClick={() => onUpdateOrder('down')} className="text-gray-500 hover:text-gray-700" title="Descendre">
              <FaArrowDown />
            </button>
          )}
          <button onClick={onDelete} className="text-red-500 hover:text-red-700" title="Supprimer">
            <FaTrash/>
          </button>
        </div>
      </div>

      {/* questions list --------------------------------------------- */}
      <div className="space-y-2 mb-4">
        {section.questions?.map((q, qIndex) => (
          <QuestionItem 
            key={q.id} 
            question={q} 
            index={qIndex}
            onDelete={() => onDeleteQuestion(q.id)}
            templateId={templateId}
            sectionId={section.id}
          />
        ))}
      </div>

      {/* add-question area ------------------------------------------ */}
      {showAdd ? (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Nouvelle question</h4>
          <div className="space-y-3">
            <input
              className="input w-full"
              placeholder="Intitulé de la question"
              value={qForm.wording}
              onChange={e => setQForm({...qForm, wording:e.target.value})}
            />
            <div className="flex gap-3">
              <select
                className="input flex-1"
                value={qForm.type}
                onChange={e => setQForm({...qForm, type:e.target.value})}
              >
                <option value="Likert">Échelle de Likert (1-5)</option>
                <option value="Binary">Binaire (Oui/Non)</option>
                <option value="Text">Texte libre</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={qForm.isRequired}
                  onChange={e => setQForm({...qForm, isRequired: e.target.checked})}
                />
                <span className="text-sm">Obligatoire</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={submitQ}
                className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1"
              >
                <FaPlus/> Ajouter
              </button>
            </div>
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAdd(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
        >
          + Ajouter une question
        </motion.button>
      )}
    </motion.div>
  );
}

/* Question Item Component */
function QuestionItem({ question, index, onDelete, templateId, sectionId }) {
  const [editing, setEditing] = useState(false);
  const [qData, setQData] = useState({
    wording: question.wording,
    type: question.type,
    isRequired: question.isRequired
  });

  const handleUpdate = async () => {
    try {
      await updateQuestion(templateId, sectionId, question.id, qData);
      question.wording = qData.wording;
      question.type = qData.type;
      question.isRequired = qData.isRequired;
      setEditing(false);
      toast.success("Question mise à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (editing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <input
          className="input w-full mb-2"
          value={qData.wording}
          onChange={(e) => setQData({...qData, wording: e.target.value})}
        />
        <div className="flex gap-2">
          <select
            className="input flex-1"
            value={qData.type}
            onChange={(e) => setQData({...qData, type: e.target.value})}
          >
            <option value="Likert">Échelle de Likert</option>
            <option value="Binary">Binaire</option>
            <option value="Text">Texte libre</option>
          </select>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={qData.isRequired}
              onChange={(e) => setQData({...qData, isRequired: e.target.checked})}
            />
            <span className="text-sm">Obligatoire</span>
          </label>
          <button onClick={handleUpdate} className="text-green-600" title="Sauvegarder">
            <FaSave />
          </button>
          <button onClick={() => {
            setQData({
              wording: question.wording,
              type: question.type,
              isRequired: question.isRequired
            });
            setEditing(false);
          }} className="text-gray-500" title="Annuler">
            <FaTimes />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
      <div className="flex-1">
        <span className="text-sm text-gray-500 mr-2">Q{index + 1}.</span>
        <span className="font-medium">{question.wording}</span>
        <span className="ml-2 text-xs text-gray-500">
          ({question.type})
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-blue-500 hover:text-blue-700"
          title="Modifier"
        >
          <FaEdit size={14}/>
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
          title="Supprimer"
        >
          <FaTrash size={14}/>
        </button>
      </div>
    </div>
  );
}

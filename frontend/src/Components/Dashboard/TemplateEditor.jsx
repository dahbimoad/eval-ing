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
    endDate: ""
  });

  // Set default dates when modal opens
  useEffect(() => {
    if (showPublishModal && !publishForm.startDate) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setPublishForm({
        startDate: tomorrow.toISOString().slice(0, 16), // Format for datetime-local
        endDate: nextWeek.toISOString().slice(0, 16)
      });
    }
  }, [showPublishModal]);

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
      } catch (error) {
        console.error('❌ Error loading sections:', error);
        toast.error("Impossible de charger les sections");
      }
    })();
  }, [tpl]);

  /* helpers ---------------------------------------------------------- */
  const addSection = async () => {
    if (!newTitle.trim()) {
      toast.error("Veuillez saisir un titre pour la section");
      return;
    }
    if (!tpl) {
      toast.error("Template introuvable");
      return;
    }

    const payload = { title: newTitle, displayOrder: sections.length + 1 };
    console.log('🔧 Creating section with payload:', payload, 'for template:', tpl.id);

    try {
      const response = await createSection(tpl.id, payload);
      console.log('✅ Section created:', response);
      
      // Refresh sections
      const sectionsResponse = await getSections(tpl.id);
      console.log('✅ Sections refreshed:', sectionsResponse.data);
      setSections(sectionsResponse.data);
      
      setNewTitle("");
      toast.success("Section ajoutée avec succès!");
    } catch (error) {
      console.error('❌ Error creating section:', error);
      toast.error("Erreur lors de l'ajout de section: " + (error.response?.data?.message || error.message));
    }
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
    
    // Swap sections
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update display orders
    newSections.forEach((section, idx) => {
      section.displayOrder = idx + 1;
    });
    
    // Update frontend immediately
    setSections(newSections);
    
    // Update backend sequentially to avoid constraint violations
    try {
      // Use a temporary high value first to avoid constraint conflicts
      const tempDisplayOrder = 9999;
      
      // Step 1: Set first section to temporary value
      await updateSection(tpl.id, newSections[index].id, { 
        title: newSections[index].title, 
        displayOrder: tempDisplayOrder 
      });
      
      // Step 2: Update second section to its final position
      await updateSection(tpl.id, newSections[targetIndex].id, { 
        title: newSections[targetIndex].title, 
        displayOrder: newSections[targetIndex].displayOrder 
      });
      
      // Step 3: Update first section to its final position
      await updateSection(tpl.id, newSections[index].id, { 
        title: newSections[index].title, 
        displayOrder: newSections[index].displayOrder 
      });
      
      toast.success("Ordre des sections mis à jour");
    } catch (error) {
      console.error("❌ Error updating section order:", error);
      toast.error("Erreur lors de la mise à jour de l'ordre");
      // Revert the frontend changes
      refreshSection();
    }
  };

  const addQuestion = async (sectionId, q) => {
    if (!tpl) return;
    
    // Map frontend form data to backend DTO format
    const questionRequest = {
      Wording: q.wording,
      Type: mapQuestionType(q.type),
      MaxLength: q.type === "Text" ? 500 : null // Set default max length for text questions
    };
    
    console.log("🔧 Creating question with data:", questionRequest);
    
    await createQuestion(tpl.id, sectionId, questionRequest)
      .then(() => {
        toast.success("Question ajoutée avec succès!");
        refreshSection(sectionId);
      })
      .catch((error) => {
        console.error("❌ Question creation failed:", error);
        toast.error("Ajout de question impossible");
      });
  };

  // Helper function to map frontend question types to backend enum values
  const mapQuestionType = (frontendType) => {
    switch (frontendType) {
      case "Likert":
        return 1; // QuestionType.Likert
      case "Binary":
        return 2; // QuestionType.Binary
      case "Text":
        return 3; // QuestionType.Text
      default:
        return 1; // Default to Likert
    }
  };

  const removeQuestion = async (sectionId, qId) => {
    if (!tpl) return;
    await apiDeleteQuestion(tpl.id, sectionId, qId)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Suppression impossible"));
  };

  const refreshSection = async (sectionId) => {
    try {
      const { data } = await getSections(tpl.id);            // quickest: reload all
      setSections(data);
    } catch (error) {
      console.error('❌ Error refreshing sections:', error);
      toast.error("Erreur lors du rafraîchissement des sections");
    }
  };

  const handlePublish = async () => {
    if (!publishForm.startDate || !publishForm.endDate) {
      toast.error("Veuillez remplir les dates de début et de fin");
      return;
    }

    // Convert dates to ISO format and validate
    const startDate = new Date(publishForm.startDate);
    const endDate = new Date(publishForm.endDate);
    
    if (endDate <= startDate) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }
    
    const publishData = {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString()
    };
    
    console.log('🔧 Publishing with data:', publishData);

    try {
      await publicationService.publish(tpl.id, publishData);
      toast.success("Questionnaire publié avec succès !");
      setShowPublishModal(false);
      nav("/admin/questionnaire");
    } catch (error) {
      console.error("❌ Publication error:", error);
      toast.error(`Erreur lors de la publication: ${error.response?.data?.message || error.message}`);
    }
  };

  const validateTemplate = () => {
    if (sections.length === 0) {
      toast.error("Le questionnaire doit contenir au moins une section");
      return false;
    }
    
    const hasEmptySections = sections.some(s => {
      const questions = s.questions || s.Questions || [];
      return questions.length === 0;
    });
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

            {(tpl.status === "Draft" || tpl.status === "draft" || tpl.status === 0) && (
              <motion.button
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔧 Template status for publish check:', tpl.status);
                  if (validateTemplate()) {
                    setShowPublishModal(true);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
              >
                Publier le questionnaire
              </motion.button>
            )}
            
            {(tpl.status === "Published" || tpl.status === "published" || tpl.status === 1) && (
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
            <strong> {sections.reduce((acc, s) => acc + ((s.questions || s.Questions)?.length || 0), 0)}</strong> question(s) au total
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
    displayOrder: ((section.questions || section.Questions)?.length || 0) + 1
  });

  const submitQ = async () => {
    if (!qForm.wording.trim()) return;
    await onAddQuestion(qForm);
    setQForm({ 
      wording: "", 
      type: "Likert",
      isRequired: true,
      displayOrder: ((section.questions || section.Questions)?.length || 0) + 2
    });
    setShowAdd(false);
  };

  const handleUpdateSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error("Le titre de la section ne peut pas être vide");
      return;
    }
    
    const updateData = { 
      title: sectionTitle.trim(), 
      displayOrder: section.displayOrder || 1
    };
    
    console.log('🔧 Updating section with data:', updateData);
    
    try {
      await updateSection(templateId, section.id, updateData);
      section.title = sectionTitle;
      setEditingSection(false);
      toast.success("Section mise à jour");
    } catch (error) {
      console.error("❌ Error updating section:", error);
      console.error("❌ Error details:", error.response?.data);
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
        {(section.questions || section.Questions || []).map((q, qIndex) => (
          <QuestionItem 
            key={q.id || q.Id} 
            question={q} 
            index={qIndex}
            onDelete={() => onDeleteQuestion(q.id || q.Id)}
            templateId={templateId}
            sectionId={section.id || section.Id}
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
      // Map frontend form data to backend DTO format
      const questionRequest = {
        Wording: qData.wording,
        Type: mapQuestionType(qData.type),
        MaxLength: qData.type === "Text" ? 500 : null
      };
      
      await updateQuestion(templateId, sectionId, question.id, questionRequest);
      question.wording = qData.wording;
      question.type = qData.type;
      question.isRequired = qData.isRequired;
      setEditing(false);
      toast.success("Question mise à jour");
    } catch (error) {
      console.error("❌ Question update failed:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Helper function to map frontend question types to backend enum values
  const mapQuestionType = (frontendType) => {
    switch (frontendType) {
      case "Likert":
        return 1; // QuestionType.Likert
      case "Binary":
        return 2; // QuestionType.Binary
      case "Text":
        return 3; // QuestionType.Text
      default:
        return 1; // Default to Likert
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

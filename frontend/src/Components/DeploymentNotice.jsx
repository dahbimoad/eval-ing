import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

/**
 * Composant de notification de déploiement réutilisable
 * @param {Object} props
 * @param {string} props.title - Le titre de la notification
 * @param {string} props.message - Le message principal
 * @param {string} props.secondaryMessage - Message secondaire
 * @param {string} props.buttonText - Texte du bouton
 * @param {string} props.storageKey - Clé pour localStorage
 * @param {boolean} props.showIcon - Afficher l'icône
 * @param {number} props.delay - Délai avant affichage (ms)
 */
export default function DeploymentNotice({
  title = "Service Temporairement Indisponible",
  message = "Ce projet n'est actuellement pas déployé en raison de contraintes budgétaires. Il s'agit d'un projet de démonstration développé dans le cadre de mon portfolio professionnel.",
  secondaryMessage = "Pour plus d'informations ou pour discuter de ce projet, n'hésitez pas à me contacter.",
  buttonText = "J'ai compris",
  storageKey = "deployment-notice-dismissed",
  showIcon = true,
  delay = 1000,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu la notification
    const isDismissed = localStorage.getItem(storageKey);
    
    if (!isDismissed) {
      // Afficher le popup après un délai
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  const handleDismiss = () => {
    // Enregistrer que l'utilisateur a vu la notification
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleDismiss}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 mx-4 relative">
          {/* Bouton de fermeture */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {showIcon && (
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
            {secondaryMessage && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {secondaryMessage}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={handleDismiss}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

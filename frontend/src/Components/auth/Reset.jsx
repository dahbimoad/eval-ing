import React, { useState, useEffect } from "react";
import './Login.css'; // Vos styles personnalisés
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

function Reset() {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer le token et l'email depuis l'URL au chargement du composant
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token de réinitialisation manquant. Veuillez vérifier votre lien.");
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (newPass !== confirmPass) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    if (newPass.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    
    // Réinitialiser les messages
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      // Utiliser la variable d'environnement pour l'URL de l'API
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Envoi des données au backend
      const response = await axios.post(`${apiUrl}/auth/reset-password`, {
        token: token,
        password: newPass,
        confirmPassword: confirmPass
      });
      
      setMessage("Votre mot de passe a été réinitialisé avec succès.");
      setLoading(false);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setLoading(false);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        setError("Le lien de réinitialisation est invalide ou a expiré.");
      } else {
        setError("Une erreur est survenue lors de la réinitialisation du mot de passe.");
      }
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    }
  };

  return (
    <div className="body-login bg-gray-200 flex min-h-screen items-center justify-center px-6 py-8 animate-slide-up">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
        
        <div className="flex-1 p-8 animate-slide-up">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl text-purple-700 font-bold mb-4 font-inter">
              Réinitialiser votre mot de passe
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            {!token ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <p className="text-yellow-700 text-center">
                  Le lien de réinitialisation est invalide. Veuillez vérifier votre email ou demander un nouveau lien.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="newPass" className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPass"
                      name="newPass"
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700">
                    Confirmez votre mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPass"
                      name="confirmPass"
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-purple-500 disabled:bg-purple-300"
                  >
                    {loading ? "Traitement en cours..." : "Réinitialiser"}
                  </button>

                  {message && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-600 text-center">{message}</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-500 text-center">{error}</p>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reset;
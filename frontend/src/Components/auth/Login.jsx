import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import loginImage from "../images/Login/Login2.png";
import './Login.css';

function Login() {
  const { login } = useAuth(); // <-- hook du contexte
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook de React Router
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password); // Fonction d'authentification
      navigate("/redirect"); // Redirection sans rechargement
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="body-login bg-gray-200 flex min-h-screen items-center justify-center px-6 py-8 animate-slide-up">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
        
        <div className="flex-1 p-8 animate-slide-up">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl text-purple-700 font-bold mb-4 font-inter">
              Connexion
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm text-[#737791] font-medium">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm sm:text-sm"
                  />
                </div>
                <div className="mt-2 text-center">
                  <a href="/forget" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-purple-500"
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 items-center justify-center rounded-r-lg overflow-hidden">
          <img
            className="h-full w-full object-cover rounded-r-lg animate-slide-up"
            src={loginImage}
            alt="Image de connexion"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;

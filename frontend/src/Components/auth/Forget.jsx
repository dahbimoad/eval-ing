import React, { useState } from "react";
import './Login.css';
// import axios from "axios";
function Forget() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("https://", {email});

      if (response.ok && data.exists) {
        setMessage("Veuillez vérifier votre boite email");
      } else {
        setError("Email non trouvé. Veuillez vérifier votre saisie.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="body-login bg-gray-200 flex min-h-screen items-center justify-center px-6 py-8 animate-slide-up">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
        <div className="flex-1 p-8 animate-slide-up">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl text-purple-700 font-bold mb-4 font-inter">
              Entrez votre email pour réinitialiser votre mot de passe
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm text-[#737791] font-medium text-gray-700">
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
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-purple-500"
                >
                  Valider
                </button>

                {message && <p className="text-green-600 text-center mt-2">{message}</p>}
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forget;

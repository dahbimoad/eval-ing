import React, { useState } from "react";
import './Login.css'; // Add your custom styles here (if needed)
import axios from "axios";
function Reset() {

    // const [newPass,setNewPass]=useState("");
    // const [confirmPass,setConfirmPass] = useState("");
    // const [message, setMessage] = useState("");
    // const [errorMessage, setErrorMessage] = useState("");
    
    // try{
    // const response = axios.post("",{newPass});
    // if(response.ok){
    //     setMessage("Votre mot de passe est réinitialiser")
    // }else{
    //     setErrorMessage("Les mots de passes ne sont pas identiques")
    // }
    // }catch(error){
    //     console.error("where is the problem ")
    // }

  return (
    
    <div className="body-login bg-gray-200 flex min-h-screen items-center justify-center px-6 py-8 animate-slide-up ">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 ">
        
        <div className="flex-1 p-8 animate-slide-up">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl  text-purple-700 font-bold  mb-4 font-inter">
            Réinitialiser
          </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <form className="space-y-6">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Entrez le nouveau mot de passe

                </label>
                <div className="mt-1">
                  <input
                    id="newPass"
                    name="newPass"
                    type="newPass"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Confirmez votre mot de passe

                </label>
                <div className="mt-1">
                  <input
                    id="confirmPass"
                    name="confirmPass"
                    type="confirmPass"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
            </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-purple-700 px-4 py-2 text-white font-semibold hover:bg-indigo-700 hover:bg-purple-500"
                >
                 Réinitialiser 
                </button>

                {/* {message && <p className="text-green-600 text-center mt-2">{message}</p>}
                {error && <p className="text-red-500 text-center mt-2">{error}</p>} */}
              </div>
            </form>
           
          </div>
        </div>


     

      </div>
    </div>
  );
}

export default Reset;

import React from "react";
import login from "../images/Login.png";
import './Login.css'; // Add your custom styles here (if needed)

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8 ">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 ">
        
        <div className="flex-1 p-8 animate-slide-up">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-[#5D5FEF] mb-4 font-inter">
            Connexion
          </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm  text-[#737791] font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm  focus:ring-indigo-500 sm:text-sm"
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
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mt-2 text-center">
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Se connecter
                </button>
              </div>
            </form>
           
          </div>
        </div>


        <div className="hidden lg:flex w-1/2 items-center justify-center bg-indigo-600 rounded-r-lg overflow-hidden">
          <img
            className="h-full w-full object-cover rounded-r-lg animate-move-right-left"
            src={login}
            alt="Image de connexion"
          />
          
        </div>

      </div>
    </div>
  );
}

export default Login;

import React from "react";

function Contact(){
    return(
        
      <div id="#contact" className=" py-16">
      <div className="max-w-screen-xl mx-auto text-center text-white">
        <h2 className="text-3xl text-purple-800 font-bold mb-6">Nous Contacter</h2>
        <p className="text-lg text-black mb-8">
          Vous avez des questions ou besoin d'assistance ? N'hésitez pas à nous contacter via le formulaire ci-dessous
          ou par email à <span className="font-semibold">contact@evaling.com</span>. Notre équipe est disponible pour vous aider.
        </p>
        
        <form className="max-w-xl mx-auto space-y-6">
          <input
            type="text"
            placeholder="Votre nom"
            className="w-full p-3 bg-gray-200 text-black rounded-lg"
          />
          <input
            type="email"
            placeholder="Votre email"
            className="w-full p-3 bg-gray-200 text-black rounded-lg"
          />
          <textarea
            placeholder="Votre message"
            className="w-full p-3 bg-gray-200 text-black rounded-lg h-32"
          />
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-300"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
    )
}
export default Contact;
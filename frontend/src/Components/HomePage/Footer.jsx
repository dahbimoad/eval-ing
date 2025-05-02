import React from "react";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className="bg-gray-500 text-white py-12">
      <div className="max-w-screen-xl mx-auto px-24">
        <div className=" text-center   grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400" style={{ fontFamily:"Sofia, sans-serif"}}>Liens rapides</h3>
            <ul>
              <li><Link to="/" className="text-sm hover:text-yellow-400" >Home</Link></li>
              <li><Link to="#function" className="text-sm hover:text-yellow-400">Fonctionnalités</Link></li>
              <li><Link to="#contact" className="text-sm hover:text-yellow-400">Contact</Link></li>
              <li><Link to="#about" className="text-sm hover:text-yellow-400">About</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400" style={{ fontFamily:"Sofia, sans-serif"}}>Suivez-nous</h3>
            <ul>
              <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-yellow-400">Facebook</a></li>
              <li><a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-yellow-400">Twitter</a></li>
              <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-yellow-400">LinkedIn</a></li>
              <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-yellow-400">Instagram</a></li>
            </ul>
          </div>

          {/* Footer Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400" style={{ fontFamily:"Sofia, sans-serif"}}>Contact</h3>
            <p className="text-sm">
              Email: <a href="mailto:contact@evaling.com" className="text-yellow-400 hover:text-yellow-300">contact@evaling.com</a>
            </p>
            <p className="text-sm">Téléphone: +123 456 7890</p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center mt-8">
        <p className="text-sm">&copy; 2025 EvalIng. Tous droits réservés.</p>
      </div>
    </div>
  );
}

export default Footer;

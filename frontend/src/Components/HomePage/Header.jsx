import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../images/HomePage/Eval.png";
import { Target, Code, ExternalLink, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';


function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isApiDropdownOpen, setIsApiDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const apiServices = [
    { name: 'API Gateway', url: 'https://api.eval-ing.live', icon: '🚀' },
    { name: 'Authentication', url: 'http://209.38.233.63:5001/docs', icon: '🔒' },
    { name: 'Catalog Service', url: 'http://209.38.233.63:5003/docs', icon: '📚' },
    { name: 'Questionnaire', url: 'http://209.38.233.63:5004/docs', icon: '📝' },
    { name: 'Statistics', url: 'http://209.38.233.63:5005/docs', icon: '📊' },
    { name: 'Project Reports & Demos', url: 'https://drive.google.com/drive/u/1/folders/1RepeGm5a3tKa8LWXnGJ7CpoN5OyxAdKA', icon: '📁' }
  ];

  return (
    <div className={`bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 text-white sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'shadow-2xl backdrop-blur-md bg-opacity-90' : 'shadow-lg'}`}>
      <header className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 animate-fade-in-left">
          <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full p-2 shadow-lg animate-pulse">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            EvalIng
          </h1>
        </div>
        
        <nav className="hidden md:flex animate-fade-in-down">
          <ul className="flex space-x-8">
            {['Home', 'Fonctionnalités', 'À propos', 'Contact'].map((item, index) => (
              <li key={item} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-down">
                <a href={`#${item.toLowerCase().replace(' ', '').replace('à', 'a')}`} className="hover:text-emerald-400 transition-all duration-300 relative group font-medium">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
            <li className="animate-fade-in-down relative" style={{ animationDelay: '0.4s' }}>
              <button 
                onClick={() => setIsApiDropdownOpen(!isApiDropdownOpen)}
                onMouseEnter={() => setIsApiDropdownOpen(true)}
                className="hover:text-emerald-400 transition-all duration-300 relative group font-medium flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-4 py-2 rounded-full border border-emerald-400/20 hover:border-emerald-400/40 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 backdrop-blur-sm"
              >
                <Code className="w-4 h-4 animate-pulse" />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                  API Docs
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isApiDropdownOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* Dropdown Menu */}
              {isApiDropdownOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-64 bg-gradient-to-br from-gray-900/95 to-blue-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-emerald-400/20 z-50 animate-fade-in-down"
                  onMouseLeave={() => setIsApiDropdownOpen(false)}
                >
                  <div className="p-2">
                    <div className="text-xs text-emerald-400 px-3 py-2 font-semibold border-b border-emerald-400/20 mb-2">
                      🔗 API Services & Documentation
                    </div>
                    {apiServices.map((service, index) => (
                      <a
                        key={service.name}
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-lg">{service.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">
                            {service.name}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                  <div className="border-t border-emerald-400/20 p-2">
                    <div className="text-xs text-gray-400 px-3 py-1 text-center">
                      ✨ Built with .NET 9 & Swagger
                    </div>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
        
        <Link to="/login" >
        <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-full hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold animate-fade-in-right">
          Se connecter
        </button>
        </Link>
      </header>
    </div>
  );
}


export default Header;

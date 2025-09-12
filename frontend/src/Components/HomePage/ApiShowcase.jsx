import React, { useState } from 'react';
import { ExternalLink, Code, Database, Shield, BarChart, FileText, X } from 'lucide-react';

function ApiShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      name: "Authentication Service",
      icon: <Shield className="w-8 h-8" />,
      description: "Secure user authentication, JWT tokens, OAuth2 integration",
      endpoint: "/docs",
      port: "5001",
      color: "from-purple-500 to-indigo-600"
    },
    {
      name: "Catalog Service", 
      icon: <Database className="w-8 h-8" />,
      description: "Formation catalogs, courses, categories management",
      endpoint: "/docs",
      port: "5003",
      color: "from-pink-500 to-red-600"
    },
    {
      name: "Questionnaire Service",
      icon: <FileText className="w-8 h-8" />,
      description: "Dynamic questionnaires, surveys, response collection",
      endpoint: "/docs", 
      port: "5004",
      color: "from-blue-500 to-cyan-600"
    },
    {
      name: "Statistics Service",
      icon: <BarChart className="w-8 h-8" />,
      description: "Analytics engine, reports, evaluation metrics",
      endpoint: "/docs",
      port: "5005", 
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <>
      {/* Main API Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce">
              <Code className="w-4 h-4" />
              <span>Backend API Documentation</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in-up">
              Explore Our 
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> API Architecture</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Dive into our comprehensive backend ecosystem. Built with .NET 9, featuring modern microservices architecture with detailed Swagger documentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-400">
              <a 
                href="https://api.eval-ing.live" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-full hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold flex items-center space-x-3 group"
              >
                <span>View API Gateway</span>
                <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </a>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-full hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center space-x-3"
              >
                <span>Explore Services</span>
                <Code className="w-5 h-5" />
              </button>

              <a 
                href="https://drive.google.com/drive/u/1/folders/1RepeGm5a3tKa8LWXnGJ7CpoN5OyxAdKA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold flex items-center space-x-3 group"
              >
                <span>📁 Reports & Demos</span>
                <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Services Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={service.name}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{service.description}</p>
                <div className="text-cyan-400 text-sm font-mono">Port: {service.port}</div>
              </div>
            ))}
          </div>

          {/* Tech Stack Badge */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-black/30 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20">
              <span className="text-gray-300 font-medium">Built with:</span>
              <div className="flex items-center space-x-6">
                <span className="text-blue-400 font-semibold">.NET 9</span>
                <span className="text-purple-400 font-semibold">Docker</span>
                <span className="text-green-400 font-semibold">PostgreSQL</span>
                <span className="text-red-400 font-semibold">Swagger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">API Services Documentation</h3>
                <p className="text-gray-400">Access comprehensive documentation for each microservice</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <div key={service.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center text-white`}>
                          {service.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-2">{service.name}</h4>
                          <p className="text-gray-400 mb-3">{service.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-cyan-400 font-mono">Port: {service.port}</span>
                            <span className="text-green-400 font-mono">Endpoint: {service.endpoint}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`http://209.38.233.63:${service.port}${service.endpoint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-gradient-to-r ${service.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 font-medium`}
                      >
                        <span>View Docs</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700/30">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <span>API Gateway Dashboard</span>
                </h4>
                <p className="text-gray-300 mb-4">
                  Access the central API Gateway for a complete overview of all services, health checks, and system status.
                </p>
                <a
                  href="https://api.eval-ing.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  <span>Open API Gateway</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-700/30">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Project Documentation & Demo Videos</span>
                </h4>
                <p className="text-gray-300 mb-4">
                  Explore comprehensive project reports, technical documentation, and demonstration videos showcasing the complete system functionality.
                </p>
                <a
                  href="https://drive.google.com/drive/u/1/folders/1RepeGm5a3tKa8LWXnGJ7CpoN5OyxAdKA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  <span>📁 View Reports & Demos</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApiShowcase;
import React from 'react';

function AnimationStyles() {
  return (
    <style>{`
      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #0f172a;
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #10b981, #0ea5e9);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #059669, #0284c7);
      }

      /* Landing page overrides — scoped so they don't bleed into dashboard */
      .landing-page input,
      .landing-page select,
      .landing-page textarea {
        background-color: transparent !important;
        color: inherit !important;
        border: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      /* Gradient text helper */
      .text-gradient {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      /* Subtle glow on cards */
      .card-glow {
        transition: box-shadow 0.4s ease;
      }
      .card-glow:hover {
        box-shadow: 0 0 40px -12px rgba(16, 185, 129, 0.25);
      }
    `}</style>
  );
}

export default AnimationStyles;
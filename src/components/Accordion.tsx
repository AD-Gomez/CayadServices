// src/components/Accordion.js
import React, { useState } from 'react';

interface Accordionprops {
  title: string,
  children: any
}

const Accordion = ({ title, children }: Accordionprops) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between text-left items-center w-full p-4 focus:outline-none"
        onClick={toggleAccordion}
      >
        <span className="text-lg text-left text-btn-blue font-medium">{title}</span>
        <svg
          className={`w-6 text-btn-blue h-6 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen &&
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="p-4">{children}</div>
        </div>
      }

    </div>
  );
};

export default Accordion;

import { useState } from 'react';
import { FaFacebookMessenger } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";


const ButtonChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isOpen && (
        <div className="mb-2 flex flex-col items-end space-y-2">
          <button className="h-12 w-12 flex items-center justify-center  text-white bg-blue-500 rounded-full shadow-lg"><FaFacebookMessenger /></button>
          <button className="h-12 w-12 flex items-center justify-center bg-green-500 text-white text-[20px] rounded-full shadow-lg"><IoLogoWhatsapp /></button>
        </div>
      )}
      <button className="h-12 w-12 flex items-center justify-center bg-btn-blue text-white rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default ButtonChat;

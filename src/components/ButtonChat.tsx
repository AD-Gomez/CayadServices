import { useState, useEffect } from 'react';
import { FaFacebookMessenger } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";

const ButtonChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleMessengerClick = () => {
    // Enviar evento a Google Analytics u otro servicio de tracking
    window.dataLayer.push({
      'event': 'click_messenger',
      'eventCategory': 'Botón de Chat',
      'eventAction': 'Clic',
      'eventLabel': 'Messenger'
    });

    setTimeout(() => {
      window.open('https://www.facebook.com/cayadservices/', '_blank');
    }, 300); // Retraso de 300 ms
  };

  const handleWhatsappClick = () => {
    // Enviar evento a Google Analytics u otro servicio de tracking
    window.dataLayer.push({
      'event': 'click_whatsapp',
      'eventCategory': 'Botón de Chat',
      'eventAction': 'Clic',
      'eventLabel': 'WhatsApp'
    });

    // Espera brevemente para asegurar que el evento se envíe antes de la redirección
    setTimeout(() => {
      window.open('https://api.whatsapp.com/send/?phone=14696190747&text&type=phone_number&app_absent=0', '_blank');
    }, 300); // Retraso de 300 ms
  };

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
      setIsAtBottom(isBottom);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed ${isAtBottom ? 'bottom-24' : 'bottom-4'} right-4 flex flex-col items-end`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isOpen && (
        <div className="mb-2 flex flex-col items-end space-y-2 transition-all duration-300">
          <button
            onClick={handleMessengerClick}
            className="h-12 w-12 flex items-center justify-center text-[1.8rem] text-white bg-blue-500 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300"
            aria-label="Open Facebook Messenger"
            data-gtm="messenger-button"  // Atributo de datos para GTM
          >
            <FaFacebookMessenger />
          </button>
          <button
            onClick={handleWhatsappClick}
            className="h-12 w-12 flex items-center justify-center bg-green-500 text-[2rem] text-white rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300"
            aria-label="Open WhatsApp"
            data-gtm="whatsapp-button"  // Atributo de datos para GTM
          >
            <IoLogoWhatsapp />
          </button>
        </div>
      )}
      <button
        className={`h-12 w-12 flex items-center justify-center bg-btn-blue text-white rounded-full shadow-lg transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
            <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ButtonChat;

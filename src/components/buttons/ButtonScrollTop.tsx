import { useState, useEffect } from 'react';

const ButtonScrollTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      const isBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;

      setIsVisible(scrolled > 100);  // Show button when scrolled down 100px
      setIsAtBottom(isBottom);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-20 flex flex-col items-end">

      <div
        className={`fixed right-[70px] ${isAtBottom ? 'bottom-[100px]' : 'bottom-[1.2rem]'} transition-all duration-300`}
        style={{ display: isVisible ? 'block' : 'none' }}  // Show/hide based on scroll position
      >
        <button
          onClick={scrollToTop}
          className="w-9 h-9 bg-btn-blue text-white flex justify-center items-center rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 stroke-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
            />
          </svg>
        </button>
      </div>
    </div>

  );
};

export default ButtonScrollTop;

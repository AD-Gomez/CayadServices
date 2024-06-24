import { useEffect } from 'react';

const AuthorizeNetSeal = () => {
  useEffect(() => {
    // Define the ANS_customer_id variable
    window.ANS_customer_id = "40b07bd0-492e-41ef-af3d-203518035d55";

    // Create a script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.language = 'javascript';
    script.src = 'https://verify.authorize.net:443/anetseal/seal.js';
    script.async = true; // Ensure the script loads asynchronously

    // Append the script to the document body
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="AuthorizeNetSeal" style={{ float: 'left' }}>
    </div>
  );
};

export default AuthorizeNetSeal;

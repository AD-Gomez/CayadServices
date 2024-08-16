import part4 from '../../public/img/part4.webp'
import ReactDOMServer from "react-dom/server";
import facebookReview2 from '../../public/img/facebookReview2.webp'
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const testimonials = [
  {
    name: "Moe Omar",
    rating: 5,
    comment: "Awesome service, second time using the service",
    userImage: part4,
    altText: "Moe Omar",
    id: 0
  },
  {
    name: "Santiago Caceres",
    rating: 5,
    comment: "Alex G at Cayad Auto Transport was amazing to work with. He helps me ship a car from Utah to Idaho without problems and with fair price. I’d definitely be using their services again.",
    userImage: part4,
    altText: "Santiago Caceres",
    id: 1
  },
  {
    name: "Elio Cruz Cano",
    rating: 5,
    comment: "Definitely the best service you can get, very professional carriers, vehicle was handled with care and got from point A to point B intact, also got here in the timeframe they said it would, I’m satisfied with the help! Recommend them 100%",
    userImage: part4,
    altText: "Elio Cruz Cano",
    id: 2
  },
  {
    name: "Feng Xue",
    rating: 5,
    comment: "Shipping a car for the first time, I was completely clueless. Fortunately, I came across Cayad and Mr. Maiky, who made everything simple and clear. From planning to execution, he provided nearly perfect service, informing me of every detail and daily progress. If I ship a car again, I will definitely choose Cayad and Maiky once more！",
    userImage: part4,
    altText: "Feng Xue",
    id: 3
  },
  {
    name: "Ivan Rivero",
    rating: 5,
    comment: "Excelente atención,profesionalidad y responsabilidad muy satisfecho quedé con el trabajo que realizan",
    userImage: part4,
    altText: "Ivan Rivero",
    id: 4
  },
  {
    name: "HEBER JOVANI OCHOA PIÃ‘ON",
    rating: 5,
    comment: "Excelente trabajo eficientes y precios justos., totalmente de confianza",
    userImage: part4,
    altText: "HEBER JOVANI OCHOA PIÃ‘ON",
    id: 5
  },
  {
    name: "S S",
    rating: 5,
    comment: "It was a pleasure working with Rick. He found me lowest price and updated me regularly from California to NY.",
    userImage: part4,
    altText: "S S",
    id: 6
  },
  {
    name: "Carlos Vega Alegria",
    rating: 5,
    comment: "Definitivamente la mejor experiencia y el servicio es súper rápido ! Gracias a Lukas por gestionar la movilidad de mi BMW S1000RR Y mi Honda CRV !! Gracias LUKAS !!!!",
    userImage: facebookReview2,
    altText: "Carlos Vega Alegria",
    id: 7
  },
  {
    name: "Robert Littlejohn",
    rating: 5,
    comment: "excellent  experience shipping  with this company. fast pick up, and fast delivery. Lucas was very helpful  and kept me up to date as my vehicle  was picked up and transported. I will definitely  use them again for my shipping  needs.",
    userImage: facebookReview2,
    altText: "Robert Littlejohn",
    id: 8
  },
  {
    name: "Brigitte Santos",
    rating: 5,
    comment: "I had to move some cars and was scammed by another transporter .. Alex was so caring and patient with my budget that he got my cars shipped.. within my budget and timeframe… Excellent customer service and quick to respond … definite shout out !!",
    userImage: facebookReview2,
    altText: "Brigitte Santos",
    id: 9
  },
  {
    name: "Riley Elder",
    rating: 5,
    comment: "Leo J arrived on time on the agreed upon day and delivered in a timely manner. Leo helped to get it off safely and went above and beyond. This is a safe transport company to go through",
    userImage: facebookReview2,
    altText: "Riley Elder",
    id: 10
  },
  {
    name: "Dave Frankenfield",
    rating: 5,
    comment: "They are very professional. I was a remote buyer of a 1938 jag XX100 roadster as such wasn’t available for the pick up. They keep in constant contact, showed up at the sellers on time and stayed in touch during the transport. The delivery driver was polite, on time and a real pro. I will use them again and strongly recommend them!!",
    userImage: facebookReview2,
    altText: "Dave Frankenfield",
    id: 11
  },
  {
    name: "Paola Cruz",
    image: '',
    rating: 5,
    comment: "Excelentee Servio👌🏻100% recomiendo , Son Muy Confiables👌🏻",
    userImage: facebookReview2,
    altText: "Paola Cruz",
    id: 12
  },
  {
    name: "Theresa Muckey",
    rating: 5,
    comment: "I would highly recommend Cayad Auto Transport.  We worked with Jackie H who kept us informed all throughout the process even with the time changes EST to MST.  Everything was perfect timing for pickup and delivery of our F150.    Thanks again Jackie H.",
    userImage: facebookReview2,
    altText: "Theresa Muckey",
    id: 13
  },
];



const renderStars = (rating: number) => {
  return (
    <div className="flex flex-row">
      {[...Array(rating)].map((_, index) => (
        <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 fill-yellow-400">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
        </svg>
      ))}
    </div>
  );
};

const SocialProof: React.FC = () => {
  const [randomReview, setRandomReview] = useState<typeof testimonials[0] | null>(null);
  const [showingToast, setShowingToast] = useState(true);

  const closeSwal = () => {
    Swal.close(); // Cierra el toast
    setShowingToast(false); // Actualiza el estado para detener el bucle
  };

  useEffect(() => {
    if (!showingToast) return; // Si no debe mostrarse, no hace nada

    const intervalId = setInterval(() => {
      showRandomReview();
    }, 240000); // 3000ms = 3 segundos

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente o al detener el bucle
  }, [showingToast]);

  const showRandomReview = () => {
    const review = testimonials[Math.floor(Math.random() * testimonials.length)];

    setRandomReview(review);
    if (review) {
      const starsHtml = ReactDOMServer.renderToString(renderStars(review.rating));

      window.closeSwal = closeSwal;

      Swal.fire({
        title: `<div class="w-full flex items-center justify-between" ><strong>${review.name}</strong>  <img src="${review.userImage.src}" alt="Custom Icon" class=" w-14 " />
        </div>`,
        html: `
          <div>${starsHtml}</div>
          <p class="text-xs">${review.comment}</p>
          <button class="absolute top-7 right-4" onclick="window.closeSwal()"><i class="w-9" ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 hover:text-btn-blue" stroke="2" >
          <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg> </i></button>`,

        timer: 10000, // El modal se cierra después de 10 segundos
        position: 'bottom-start', // Cambia 'top-end' a 'bottom-end', 'top-start', etc. según la posición deseada
        showConfirmButton: false,
        toast: true,
        customClass: {
          popup: 'custom-swal',
        },
      });
    }
  };

  <style>{`
    .swal2-popup.swal2-toast .swal2-close {
      align-self: start;
    }
  `}</style>



  return null
};

export default SocialProof
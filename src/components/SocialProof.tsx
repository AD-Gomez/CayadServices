import part4 from '../../public/img/part4.webp'
import ReactDOMServer from "react-dom/server";

import facebookReview2 from '../../public/img/facebookReview2.jpeg'
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const testimonials = [
  {
    name: "Moe Omar",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjUE9WfAxktuUTQHRbSJFbO9coZvY1Bzo6ZBTTfh2XheXCm7u1GV=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Awesome service, second time using the service",
    link: "https://www.google.com/maps/contrib/112079156209575097076/reviews?hl=en-GB",
    userImage: part4,
    altText: "Moe Omar",
    id: 0
  },
  {
    name: "Santiago Caceres",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjXwNOMW8_aQSW7tzSra1biY72AhZoCGHXFkMNORG8S9WVOpSoRn=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Alex G at Cayad Auto Transport was amazing to work with. He helps me ship a car from Utah to Idaho without problems and with fair price. I’d definitely be using their services again.",
    link: "https://www.google.com/maps/contrib/102787767697976243009/reviews/@36.8332502,-101.4969573,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?hl=en-GB&entry=ttu",
    userImage: part4,
    altText: "Santiago Caceres",
    id: 1
  },
  {
    name: "Elio Cruz Cano",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjUDkw7ELgCKxOcLhvLoB4HN3UZGTOytRTMRlmokip4rvOqVM-Br=s36-c-rp-mo-br100',
    rating: 5,
    comment: "Definitely the best service you can get, very professional carriers, vehicle was handled with care and got from point A to point B intact, also got here in the timeframe they said it would, I’m satisfied with the help! Recommend them 100%",
    link: "https://maps.app.goo.gl/EQCKrgJbQokz7f6w6",
    userImage: part4,
    altText: "Elio Cruz Cano",
    id: 2
  },
  {
    name: "Feng Xue",
    image: 'https://lh3.googleusercontent.com/a/ACg8ocJ_VVQ7JC2QjFHnI0FYPxdcvNp_OU8Unpzp3OM__i-HF6z1xA=s36-c-rp-mo-br100',
    rating: 5,
    comment: "Shipping a car for the first time, I was completely clueless. Fortunately, I came across Cayad and Mr. Maiky, who made everything simple and clear. From planning to execution, he provided nearly perfect service, informing me of every detail and daily progress. If I ship a car again, I will definitely choose Cayad and Maiky once more！",
    link: "https://maps.app.goo.gl/kU6RyvGmcJTaB1BEA",
    userImage: part4,
    altText: "Feng Xue",
    id: 3
  },
  {
    name: "Ivan Rivero",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVXyptdS-K6uObP24Vy6KPgzXcGBGX5urCyOiOLdBwiDglgv-gS=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Excelente atención,profesionalidad y responsabilidad muy satisfecho quedé con el trabajo que realizan",
    link: "https://maps.app.goo.gl/UJiwWmKXxwZ6bihd6",
    userImage: part4,
    altText: "Ivan Rivero",
    id: 4
  },
  {
    name: "HEBER JOVANI OCHOA PIÃ‘ON",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVA6crg0DDBkoYJqyQJGvHohRuEkXoaoWwfFfq44M0Wa5f5gqeIWQ=s36-c-rp-mo-br100',
    rating: 5,
    comment: "Excelente trabajo eficientes y precios justos., totalmente de confianza",
    link: "https://maps.app.goo.gl/MitjAiuGYz8uAPrw6",
    userImage: part4,
    altText: "HEBER JOVANI OCHOA PIÃ‘ON",
    id: 5
  },
  {
    name: "S S",
    image: 'https://lh3.googleusercontent.com/a/ACg8ocL6a8r2bmRe3KaFImRceYN7kBuNAod8Wxx8VsZnFe9xxrcYAQ=s36-c-rp-mo-br100',
    rating: 5,
    comment: "It was a pleasure working with Rick. He found me lowest price and updated me regularly from California to NY.",
    link: "https://maps.app.goo.gl/mJZemS8CQy5myn8VA",
    userImage: part4,
    altText: "S S",
    id: 6
  },
  {
    name: "Carlos Vega Alegria",
    image: '',
    rating: 5,
    comment: "Definitivamente la mejor experiencia y el servicio es súper rápido ! Gracias a Lukas por gestionar la movilidad de mi BMW S1000RR Y mi Honda CRV !! Gracias LUKAS !!!!",
    link: "https://www.facebook.com/share/p/QgxyPgUFuGu2SAvL/",
    userImage: facebookReview2,
    altText: "Carlos Vega Alegria",
    id: 7
  },
  {
    name: "Robert Littlejohn",
    image: '',
    rating: 5,
    comment: "excellent  experience shipping  with this company. fast pick up, and fast delivery. Lucas was very helpful  and kept me up to date as my vehicle  was picked up and transported. I will definitely  use them again for my shipping  needs.",
    link: "https://www.facebook.com/share/p/aD2Lsq1rPJgzGJoy/",
    userImage: facebookReview2,
    altText: "Robert Littlejohn",
    id: 8
  },
  {
    name: "Brigitte Santos",
    image: '',
    rating: 5,
    comment: "I had to move some cars and was scammed by another transporter .. Alex was so caring and patient with my budget that he got my cars shipped.. within my budget and timeframe… Excellent customer service and quick to respond … definite shout out !!",
    link: "https://www.facebook.com/share/p/21Dn9UoBGuV4nBEt/",
    userImage: facebookReview2,
    altText: "Brigitte Santos",
    id: 9
  },
  {
    name: "Riley Elder",
    image: '',
    rating: 5,
    comment: "Leo J arrived on time on the agreed upon day and delivered in a timely manner. Leo helped to get it off safely and went above and beyond. This is a safe transport company to go through",
    link: "https://www.facebook.com/share/p/jpVmuQfcedskN7sL/",
    userImage: facebookReview2,
    altText: "Riley Elder",
    id: 10
  },
  {
    name: "Dave Frankenfield",
    image: '',
    rating: 5,
    comment: "They are very professional. I was a remote buyer of a 1938 jag XX100 roadster as such wasn’t available for the pick up. They keep in constant contact, showed up at the sellers on time and stayed in touch during the transport. The delivery driver was polite, on time and a real pro. I will use them again and strongly recommend them!!",
    link: "https://www.facebook.com/share/p/uKK62GzDn9wwkpr4/",
    userImage: facebookReview2,
    altText: "Dave Frankenfield",
    id: 11
  },
  {
    name: "Paola Cruz",
    image: '',
    rating: 5,
    comment: "Excelentee Servio👌🏻100% recomiendo , Son Muy Confiables👌🏻",
    link: "https://www.facebook.com/share/p/vu7Wo4GbxNFysvNo/",
    userImage: facebookReview2,
    altText: "Paola Cruz",
    id: 12
  },
  {
    name: "Theresa Muckey",
    image: '',
    rating: 5,
    comment: "I would highly recommend Cayad Auto Transport.  We worked with Jackie H who kept us informed all throughout the process even with the time changes EST to MST.  Everything was perfect timing for pickup and delivery of our F150.    Thanks again Jackie H.",
    link: "https://www.facebook.com/share/p/AuFEabFQZT7n5qqG/",
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

  useEffect(() => {
    const timer = setTimeout(() => {
      showRandomReview();
    }, 3000); // 900000ms = 15 minutos

    return () => clearTimeout(timer);
  }, []);

  const showRandomReview = () => {
    const review = testimonials[Math.floor(Math.random() * testimonials.length)];
    setRandomReview(review);
    if (review) {
      const starsHtml = ReactDOMServer.renderToString(renderStars(review.rating));

      Swal.fire({
        title: `<strong>${review.name}</strong>`,
        html: `
          <div>${starsHtml}</div>
          <p class="text-xs">${review.comment}</p>
        `,
        iconHtml: `<img src="${review.userImage.src}" alt="Custom Icon" class="w-16 " />`,
        iconColor: 'transparent',
        imageWidth: 60,
        imageHeight: 60,
        timer: 10000, // El modal se cierra después de 10 segundos
        position: 'bottom-start', // Cambia 'top-end' a 'bottom-end', 'top-start', etc. según la posición deseada
        showConfirmButton: false,
        toast: true,
      });
    }
  };

  return null;
};

export default SocialProof
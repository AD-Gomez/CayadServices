import part4 from '../../public/img/part4.webp'
import ReactDOMServer from "react-dom/server";

import facebookReview2 from '../../public/img/facebookReview2.jpeg'
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const testimonials = [
  {
    name: "Antonio Martinez",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjUE9WfAxktuUTQHRbSJFbO9coZvY1Bzo6ZBTTfh2XheXCm7u1GV=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Excelente compañía mi carro llego muy bien a  su destino se lo recomiendo son muy responsable y además no cobran tan caro por llevar tu carro,",
    link: "https://www.google.com/maps/contrib/112079156209575097076/reviews?hl=en-GB",
    userImage: part4,
    altText: "Antonio Martinez",
    id: 0
  },
  {
    name: "Ramses Lara",
    image: 'https://scontent.fccs3-2.fna.fbcdn.net/v/t1.6435-1/102802572_665660624016806_3203696689356932331_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=100&ccb=1-7&_nc_sid=e4545e&_nc_ohc=oN-nXsY06JEQ7kNvgF16EIv&_nc_ht=scontent.fccs3-2.fna&oh=00_AYDBB7PI2_4cyLQPKNnZfKy7O5smOXaFvI1lyy-1IAM42Q&oe=66C5DE8C',
    rating: 5,
    comment: "Excelente servicio y atención al cliente. For that reason i will make business again. Thank you so much",
    link: "https://www.facebook.com/permalink.php?story_fbid=1548929205689939&id=100017186221123&ref=embed_post",
    userImage: part4,
    altText: "Hhrg Ramirez",
    id: 2
  },
  {
    name: "Santiago Caceres",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjXwNOMW8_aQSW7tzSra1biY72AhZoCGHXFkMNORG8S9WVOpSoRn=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Alex G at Cayad Auto Transport was amazing to work with. He helps me ship a car from Utah to Idaho without problems and with fair price. I’d definitely be using their services again.",
    link: "https://www.google.com/maps/contrib/102787767697976243009/reviews/@36.8332502,-101.4969573,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?hl=en-GB&entry=ttu",
    userImage: part4,
    altText: "Paul Rosales",
    id: 1
  },
  {
    name: "Miguel Angel Espinosa",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t39.30808-1/453873207_10168929951145481_4117795736379546033_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=107&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=ItLbtbmBTGIQ7kNvgEBdrZO&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCAf_DlqeVjK4WOGN8-t_BNwA071MJhwSyDZYoVhRbpvA&oe=66BA93BE',
    rating: 5,
    comment: "Llevo varios envíos de auto y maquinas y el servicio es excelente lo recomiendo totalmente , además de que siempre está al pendiente y escuchando todas la necesidades y el precio ni se diga siempre busca el mejor precio",
    link: "https://www.facebook.com/kimmy.tennant/posts/10168525934190481?ref=embed_post",
    userImage: part4,
    altText: "Kimmy Tennant",
    id: 3
  },
  {
    name: "Hector Rodriguez",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVXyptdS-K6uObP24Vy6KPgzXcGBGX5urCyOiOLdBwiDglgv-gS=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Muy buen servicio Jackie estuvo en contacto todo el tiempo desde que recogieron el vehículo hasta que lo entregaron gracias 100% recomendado",
    link: "https://www.google.com/maps/contrib/115116084854189813969/reviews/@37.0668996,-96.2086757,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?entry=ttu",
    userImage: part4,
    altText: "Hector Rodriguez",
    id: 4
  },
  {
    name: "Gilberto Esrevez",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t1.6435-1/33920933_10215860728529327_6365152725356773376_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=109&ccb=1-7&_nc_sid=e4545e&_nc_ohc=M7zWV1CqMPQQ7kNvgErr_4w&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCPDgiDDVpiggt_M5tJ-jpM7lSwFBOkcNqm_W7UI7HN2Q&oe=66C5D8F3',
    rating: 5,
    comment: "Muy recomendado al 100%, excelente empresa para mover un carro a cualquier estado de los estados unidos. Gracias Leo un excelente trabajo.",
    link: "https://www.facebook.com/adot.khan.7/posts/10232305783965435?ref=embed_post",
    userImage: part4,
    altText: "Gilberto Esrevez",
    id: 5
  },
  {
    name: "Jorge Corona",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjXusMMqJ6c8Fws5d8PSARGHm01MN_yaeQGkgytYUqhhoBm-qTc=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Muy buen servicio mi primer traslado estaba un poco inseguro pero al final que de muy contento todo a tiempo apesar dela larga distancia md to laredo tx exlelente trato muchas gracias a Erick por su ayuda y profecionalismo continuamente me informaba donde hiba mi auto Altamente recomendable",
    link: "https://www.google.com/maps/contrib/105406262029060010977/reviews?hl=en-GB",
    userImage: part4,
    altText: "Jorge Corona",
    id: 6
  },
  {
    name: "Gilberto Martinez ",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t39.30808-1/453873207_10168929951145481_4117795736379546033_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=107&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=ItLbtbmBTGIQ7kNvgEBdrZO&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCAf_DlqeVjK4WOGN8-t_BNwA071MJhwSyDZYoVhRbpvA&oe=66BA93BE',
    rating: 5,
    comment: "fue mi primera vez en enviar un  carro, y estoy satisfecho,  muy confiable , 100% recomendados,  muy responsables y atención de primera gracias LEO por todo . ",
    link: "https://www.facebook.com/kimmy.tennant/posts/10168525934190481?ref=embed_post",
    userImage: facebookReview2,
    altText: "Kimmy Tennant",
    id: 3
  },
  {
    name: "Roberto Vasquez",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVXyptdS-K6uObP24Vy6KPgzXcGBGX5urCyOiOLdBwiDglgv-gS=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "I needed to transport a car from out of state A friend recommended a company that he use before, I call them and they were supposed to pick my truck from Washington to Los Angeles California. 1 week had pass and long story short , I decided to look for another transport company. I found Cayad auto transport on Facebook I send them a message and they took care of the rest. I highly recommend this company it was fast and affordable. I will be using their services.",
    link: "https://www.google.com/maps/contrib/115116084854189813969/reviews/@37.0668996,-96.2086757,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?entry=ttu",
    userImage: facebookReview2,
    altText: "Roberto Vasquez",
    id: 4
  },
  {
    name: "Louis Pichardo",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t1.6435-1/33920933_10215860728529327_6365152725356773376_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=109&ccb=1-7&_nc_sid=e4545e&_nc_ohc=M7zWV1CqMPQQ7kNvgErr_4w&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCPDgiDDVpiggt_M5tJ-jpM7lSwFBOkcNqm_W7UI7HN2Q&oe=66C5D8F3',
    rating: 5,
    comment: "Fue mi primera vez en mover un auto definitivamente lo recomiendo, es confiable buen precio, pagas al recibir, atención constante, buen trato, respuestas concretas, información del traslado por GPS. Excelente servicio. 10/10",
    link: "https://www.facebook.com/adot.khan.7/posts/10232305783965435?ref=embed_post",
    userImage: facebookReview2,
    altText: "Louis Pichardo",
    id: 5
  },
  {
    name: "Saeed Bubshait",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t39.30808-1/453873207_10168929951145481_4117795736379546033_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=107&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=ItLbtbmBTGIQ7kNvgEBdrZO&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCAf_DlqeVjK4WOGN8-t_BNwA071MJhwSyDZYoVhRbpvA&oe=66BA93BE',
    rating: 5,
    comment: "I had an amazing experience with them fast and safe and Leo J is the best he reply very fast and very honest and helpful.",
    link: "https://www.facebook.com/kimmy.tennant/posts/10168525934190481?ref=embed_post",
    userImage: facebookReview2,
    altText: "Kimmy Tennant",
    id: 3
  },
  {
    name: "John Shanda",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVXyptdS-K6uObP24Vy6KPgzXcGBGX5urCyOiOLdBwiDglgv-gS=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "A++ service! Very professional and get the job done right! Highly recommended!",
    link: "https://www.google.com/maps/contrib/115116084854189813969/reviews/@37.0668996,-96.2086757,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?entry=ttu",
    userImage: facebookReview2,
    altText: "John Shanda",
    id: 4
  },
  {
    name: "Marcela Gomez",
    image: 'https://scontent.fccs3-1.fna.fbcdn.net/v/t1.6435-1/33920933_10215860728529327_6365152725356773376_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=109&ccb=1-7&_nc_sid=e4545e&_nc_ohc=M7zWV1CqMPQQ7kNvgErr_4w&_nc_ht=scontent.fccs3-1.fna&oh=00_AYCPDgiDDVpiggt_M5tJ-jpM7lSwFBOkcNqm_W7UI7HN2Q&oe=66C5D8F3',
    rating: 5,
    comment: "Alex at Cayad Auto Transport, was awesome , he when beyond our expectations he help my husband and I to get our car shipped to Austin, he was always communicating and letting us know about the process. Our driver was very professional and punctual.",
    link: "https://www.facebook.com/adot.khan.7/posts/10232305783965435?ref=embed_post",
    userImage: facebookReview2,
    altText: "Marcela Gomez",
    id: 5
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
    }, 300000); // 900000ms = 15 minutos

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
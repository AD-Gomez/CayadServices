export interface Review {
  author: string;
  source: 'Google' | 'Facebook';
  stars: number;
  text: string;
  link: string;
  title?: string;
}

export const reviews: Review[] = [
  {
    author: "Jesus Edel Lopez Navas",
    source: "Google",
    stars: 5,
    text: "Very reliable auto transport company, they got my vehicle shipped faster than expected for a very reasonable price. Thanks to AD Gomez for all the help! 5/5 would recommend to anyone.",
    link: "https://g.co/kgs/u8ncWY",
    title: "Great Communication"
  },
  {
    author: "Alin Bita",
    source: "Google",
    stars: 5,
    text: "AD Gomez thank you for your fast and easy shipping services, my car was able to get from point A to point B in the same condition. Definitely working with you again.",
    link: "https://g.co/kgs/bqMySm",
    title: "Professional Driver"
  },
  {
    author: "Alneidismar G",
    source: "Google",
    stars: 5,
    text: "Agradecida por su Servicio, son confiables, profesionales y tienen comunicación constante, los recomiendo para mover su Auto.",
    link: "https://g.co/kgs/WHio9k",
    title: "Great Service"
  },
  {
    author: "JUAN MA LEON",
    source: "Google",
    stars: 5,
    text: "Totalmente recomendable, la comunicación es muy buena todo el tiempo están al pendiente de la entrega, los costos son mejores que otras compañías, es una empresa total mente sería. Un 10 de 10 felicidades y que sigan cosechando éxito!!",
    link: "https://g.co/kgs/zuGeg2",
    title: "Appreciative Service"
  },
  {
    author: "John Shanda",
    source: "Facebook",
    stars: 5,
    text: "A++ service! Very professional and get the job done right! Highly recommended!",
    link: "https://www.facebook.com/john.shanda.9/posts/3844459602543904?ref=embed_post",
    title: "Very professional"
  },
  {
    author: "Juan Arevalo",
    source: "Facebook",
    stars: 5,
    text: "Delivered my car within 24 hours for a great price. Will sure be using them again in the future. Thank you so much ad gomez for all your help",
    link: "https://www.facebook.com/juan.arevalo.9/posts/7582721258432449?ref=embed_post",
    title: "Great customer service from begging to end"
  },
  {
    author: "Azhar Sim",
    source: "Facebook",
    stars: 5,
    text: "El dueño de Erik muy servicial nos dio grandes tarifas, nos dio la ubicación actual de nuestros vehículos la entrega fue muy suave",
    link: "https://www.facebook.com/shumaila.sattar.121/posts/1653340475406408?ref=embed_post",
    title: "Recomiendo definitivamente"
  },
  {
    author: "Theresa Muckey",
    source: "Facebook",
    stars: 5,
    text: "I would highly recommend Cayad Auto Transport. We worked with Jackie H who kept us informed all throughout the process even with the time changes EST to MST. Everything was perfect timing for pickup and delivery of our F150. Thanks again Jackie H.",
    link: "https://www.facebook.com/theresa.muckey/posts/8212026042152378?ref=embed_post",
    title: "I would highly recommend Cayad Auto Transport."
  },
  {
    author: "Joe Smith",
    source: "Google",
    stars: 5,
    text: "Your company is the best I hired you guys to pick up model a for me and I had to cancel because of paperwork for estate was not ready. You did not even charge me your company is the best thank u so much",
    link: "https://g.co/kgs/ZyGQu9",
    title: "Good Communication"
  },
  {
    author: "Geordanis Hernandez",
    source: "Google",
    stars: 5,
    text: "AD was extremely helpful, he has moved two cars for me already and always very responsive and a great person to work with!",
    link: "https://g.co/kgs/uiohF9",
    title: "Reliable"
  },
  {
    author: "Jordan Allen",
    source: "Google",
    stars: 5,
    text: "I've worked with AD for a couple years now, he's shipped 10 or so rigs for me. First time I was a little worried doing all this through messenger, but now he's my go to guy.",
    link: "https://g.co/kgs/V3mtYJ",
    title: "I Recommend Everyone"
  }
];

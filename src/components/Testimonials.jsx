import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Pagination, Autoplay, A11y } from "swiper";
import { FaQuoteRight } from "react-icons/fa6";
import "swiper/css";
import "../styles/animate.css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import part4 from "../../public/img/part4.webp";
import client from "../../public/img/client.webp";

SwiperCore.use([Pagination, Autoplay, A11y]);

const testimonials = [
  {
    name: "body shop",
    image: client,
    rating: 5,
    comment: "",
    link: "https://g.co/kgs/K5aLkF",
    userImage: part4,
    altText: "body shop",
    id: 0
  },
  {
    name: "Paul Rosales",
    image: client,
    rating: 5,
    comment:
      "Excelente servicio! Comunicación al 100 ! Es nuestra mejor opción para bajar autos a la frontera de Mexico!! 💯 recomendado!!",
    link: "https://g.co/kgs/S42ZLt",
    userImage: part4,
    altText: "Paul Rosales",
    id: 1
  },
  {
    name: "Peter Fielding",
    image: client,
    rating: 5,
    comment: "Fantastic communications from Leo J. Good service",
    link: "https://g.co/kgs/oAgbJ7",
    userImage: part4,
    altText: "Peter Fielding",
    id: 2
  },
  {
    name: "Abner Aquino",
    image: client,
    rating: 5,
    comment: "Great communication, fast service! Very friendly 10/10",
    link: "https://g.co/kgs/wcnicu",
    userImage: part4,
    altText: "Abner Aquino",
    id: 3
  },
  {
    name: "William Guzmán",
    image: client,
    rating: 5,
    comment: "Muy eficiente trabajo, rápido y honesto.",
    link: "https://g.co/kgs/xoFQ8j",
    userImage: part4,
    altText: "William Guzman",
    id: 4
  },
  {
    name: "Kenny Gonzalez",
    image: client,
    rating: 5,
    comment: "Thank you for your service. Everything OK",
    link: "https://g.co/kgs/SuY5oG",
    userImage: part4,
    altText: "Kenny Gonzalez",
    id: 5
  },
  {
    name: "Angel Espinoza",
    image: client,
    rating: 5,
    comment: "Good service.. and good price",
    link: "https://g.co/kgs/nzeuzs",
    userImage: part4,
    altText: "Angel Espinoza",
    id: 6
  }
];

const renderStars = (rating) => {
  return (
    <div className="flex flex-row">
      {[...Array(rating)].map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5 fill-yellow-400"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
            clipRule="evenodd"
          />
        </svg>
      ))}
    </div>
  );
};

const Testimonials = () => {
  const swiperRef = useRef < Swiper | null > (null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      setActiveIndex(swiperRef.current.swiper.realIndex);
    }
  };

  return (
    <div className="w-3/4 fadeInUp xs:w-full md:w-11/12" data-wow-delay="0.5s">
      <h2 className="text-center text-4xl font-medium">Our Customers Say</h2>
      <Swiper
        ref={swiperRef}
        spaceBetween={20}
        centeredSlides={true}
        loop={true}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 40 },
          1024: { slidesPerView: 3, spaceBetween: 60 },
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        onSlideChange={handleSlideChange}
        className="h-72 w-full xs:px-4 sm:px-4"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={testimonial.id}>
            <div
              className={`w-full fadeInUp xs:px-4 sm:px-4 p-4 my-5 ${activeIndex === index ? "shadow-2xl" : ""
                }`}
            >
              <FaQuoteRight className="text-text-light bg-transparent text-5xl absolute top-0 right-1" />
              <div className="w-full xs:px-4 sm:px-4 flex flex-row xs:flex-row md:flex-row justify-evenly items-center">
                <div className="w-16">
                  <img
                    src={testimonial.image.src}
                    className="bg-cover"
                    alt="img"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-normal mb-2">
                    {testimonial.name}
                  </h4>
                  {renderStars(testimonial.rating)}
                </div>
                <div className="w-16 mt-4">
                  <img
                    src={testimonial.userImage.src}
                    className="bg-cover"
                    alt="image google"
                  />
                </div>
              </div>
              <div className="flex flex-col p-4 text-justify text-p-landing">
                {testimonial.comment}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper as SwiperInstance } from 'swiper';
import iconFacebookReview from '../../public/img/iconFacebookReview.svg'
import part4 from '../../public/img/part4.webp'
import facebookReview2 from '../../public/img/facebookReview2.jpeg'

import 'swiper/css'
import '../styles/animate.css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { FaQuoteRight } from "react-icons/fa6";

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
    name: "Hhrg Ramirez",
    image: 'https://scontent-hou1-1.xx.fbcdn.net/v/t1.6435-1/102802572_665660624016806_3203696689356932331_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=100&ccb=1-7&_nc_sid=5f2048&_nc_ohc=wuSSzH9Y3o8Q7kNvgHoBYi6&_nc_ht=scontent-hou1-1.xx&oh=00_AYBL4SHZtcW36yW1B-QkbWwN2bnKWSes7oFhbCxf73VZBA&oe=669943CC',
    rating: 5,
    comment: "Muy profesional y excelente servicio hasta ahora el mejor servicio de transporte que he contratado. Recomiendo 100%,. Muy rápida y buena comunicación.",
    link: "https://www.facebook.com/permalink.php?story_fbid=1548929205689939&id=100017186221123&ref=embed_post",
    userImage: facebookReview2,
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
    name: "Kimmy Tennant",
    image: 'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-1/448155056_10168704373515481_4194682595358495062_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=108&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=uqoKlkPdyiAQ7kNvgFg2mOo&_nc_ht=scontent-dfw5-2.xx&oh=00_AYBq6U6Y__zktdRu0R43IfSgfwFxvJVlC2SbyAzp_TYobQ&oe=668C81F6',
    rating: 5,
    comment: "very good company Lucas was on top of things and kept me updated on everything very good transportation company thanks again!!!",
    link: "https://www.facebook.com/kimmy.tennant/posts/10168525934190481?ref=embed_post",
    userImage: facebookReview2,
    altText: "Kimmy Tennant",
    id: 3
  },
  {
    name: "Jordan Allen",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVXyptdS-K6uObP24Vy6KPgzXcGBGX5urCyOiOLdBwiDglgv-gS=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "I've worked with AD for a couple years now, he's shipped 10 or so rigs for me. First time I was a little worried doing all this through messenger, but now he's my go to guy.",
    link: "https://www.google.com/maps/contrib/115116084854189813969/reviews/@37.0668996,-96.2086757,5z/data=!3m1!4b1!4m3!8m2!3m1!1e1?entry=ttu",
    userImage: part4,
    altText: "jordan allen",
    id: 4
  },
  {
    name: "Abir Khan",
    image: 'https://scontent-hou1-1.xx.fbcdn.net/v/t1.6435-1/33920933_10215860728529327_6365152725356773376_n.jpg?stp=cp0_dst-jpg_p40x40&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=K5MZivfpbEcQ7kNvgHQzwrv&_nc_ht=scontent-hou1-1.xx&oh=00_AYDzbvfa_mBLaU6nqfUpbrbac9DZj2Eei9bLDJ6PCITwDw&oe=66993E33',
    rating: 5,
    comment: "11/10. Maiky was amazing in his communication and transparency. Car was delivered from IL to NY with no issues and they even provide live upates and location tracking! Would not hesitate to use their services again.",
    link: "https://www.facebook.com/adot.khan.7/posts/10232305783965435?ref=embed_post",
    userImage: facebookReview2,
    altText: "Abir Khan",
    id: 5
  },
  {
    name: "Jose Santiago",
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjXusMMqJ6c8Fws5d8PSARGHm01MN_yaeQGkgytYUqhhoBm-qTc=w60-h60-p-rp-mo-br100',
    rating: 5,
    comment: "Call  Leo Took care of me. They brought my vehicle to my house. The best service I ever have. These are the great people that you can trust on",
    link: "https://www.google.com/maps/contrib/105406262029060010977/reviews?hl=en-GB",
    userImage: part4,
    altText: "Jose Santiago",
    id: 6
  }
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

interface testimonialsType {
  title: string
  position?: string
}

const Testimonials = ({ title, position }: testimonialsType) => {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = () => {
    if (swiperRef.current) {
      setActiveIndex(swiperRef.current.realIndex);
    }
  };

  return (
    <div className="w-[78%] fadeInUp xs:w-full md:w-11/12" data-wow-delay="0.5s">
      {position === 'left'
        ? <h2 className="xs:px-4 sm:px-4 w-full mb-8 text-4xl font-medium">
          {title}
        </h2>
        : <h2 className="text-center mb-8 text-4xl font-medium">
          {title}
        </h2>
      }
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Pagination, A11y, Autoplay]}
        spaceBetween={20}
        centeredSlides={true}
        loop={true}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 60,
          },
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        onSlideChange={handleSlideChange}
        className="h-[350px] w-full xs:px-4 sm:px-4"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={testimonial.id}>
            <div className={`w-full cursor-pointer xs:px-4 sm:px-4 p-4 my-5 ${activeIndex === index ? 'shadow-2xl fadeInUp' : ''}`}>
              <a href={testimonial.link} target="_blank">
                <FaQuoteRight className="text-text-light bg-transparent text-5xl absolute top-0 right-1" />
                <div className="w-full xs:px-4 sm:px-4 flex flex-row xs:flex-row md:flex-row justify-evenly items-center">
                  <div className="w-16">
                    <img src={testimonial.image} className="bg-contain rounded-[50%] h-[50px] w-[50px]" alt="img" />
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-normal mb-2">
                      {testimonial.name}
                    </h4>
                    {renderStars(testimonial.rating)}
                  </div>
                  <div className="w-16 mt-4">
                    <img src={testimonial.userImage.src} className="bg-cover" alt="image google" />
                  </div>
                </div>
                <div className="flex flex-col p-4 text-justify text-p-landing">
                  {testimonial.comment}
                </div>
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;

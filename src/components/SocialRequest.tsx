import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import userIcon from '../../public/icons/userIcon.svg'
import ReactDOMServer from "react-dom/server";

const request = [
  {
    name: 'Miguel Marabay',
    car: 'Ford Explorer',
    origin_state: "Miami, Fl",
    userImage: userIcon,
    destination_state: 'Minesota',
    onlyName: true
  },
  {
    name: 'Jesus Salazar',
    car: 'Mitsubichi Lancer',
    origin_state: "Miami, Fl",
    userImage: userIcon,
    destination_state: 'Minesota',
    onlyName: false
  }
]


const SocialRequest: React.FC = () => {
  const [randomReview, setRandomReview] = useState<typeof request[0] | null>(null);
  const [showingToast, setShowingToast] = useState(true);

  const closeSwal = () => {
    console.log('sasas');
    Swal.close(); // Cierra el toast
    setShowingToast(false); // Actualiza el estado para detener el bucle
  };

  useEffect(() => {
    if (!showingToast) return; // Si no debe mostrarse, no hace nada

    const intervalId = setInterval(() => {
      showRandomReview();
    }, 300000); // 3000ms = 3 segundos 300000

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente o al detener el bucle
  }, [showingToast]);

  const showRandomReview = () => {
    const review = request[Math.floor(Math.random() * request.length)];

    const title = ReactDOMServer.renderToString(
      review.onlyName
        ? <><img src="/public/img/location.jpeg" alt="Custom Icon" className="mr-4 w-6 " /> <strong>{review.name} 6 others</strong></>
        : <><img src="/public/img/location.jpeg" alt="Custom Icon" className="mr-4 w-6 " /> <strong>{review.name}</strong></>
    );

    setRandomReview(review);

    if (review) {

      window.closeSwal = closeSwal;

      Swal.fire({
        title: `<div class="w-full flex items-center justify-start" >${title}
          </div>`,
        html: `
            <p class="text-sm">7 bookings on last 30 min</p>

            <div class="flex text-sm   items-center w-full justify-between">
              <div class='flex  items-center'>
                <div><img src="../img/point_a.webp" alt="Point A" /> </div>
                <p class='ml-2' >
                  Origin
                </p>
              </div>
              <div class=" ">
                -
              </div>
              <div class='flex items-center'>
                <p class='  mr-2' >
                  Destination
                </p>
                <div class='w-9'> <img width="8px" src="../img/point_b.webp" alt="Point B" /></div>
              </div>
            </div>

             <div class=" pr-8 text-sm">
              <div class=" flex justify-between">
                <p class='mr-1'>${review.origin_state}</p>
                <p class='mr-2'>${review.destination_state}</p>
              </div>
            </div>

            <button class="absolute top-7 right-4" onclick="window.sasa()"><i class="w-9" ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 hover:text-btn-blue" stroke="2" >
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg> </i></button>`,

        timer: 1000000000, // El modal se cierra después de 10 segundos
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

export default SocialRequest
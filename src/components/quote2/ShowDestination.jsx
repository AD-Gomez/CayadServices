import React, { useEffect, useState } from 'react';
const ShowDestination = () => {
  const [isClient, setIsClient] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    setIsClient(true);

    const dataLead = localStorage.getItem('lead');
    const jsonLead = dataLead ? JSON.parse(dataLead) : undefined;

    if (jsonLead) {
      const originCity = jsonLead.origin_city || jsonLead.origin_postal_code;
      const destinationCity = jsonLead.destination_city || jsonLead.destination_postal_code;
      setOrigin(originCity);
      setDestination(destinationCity);
    }
  }, []);

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);
      } else {
        console.error('Error al trazar la ruta:', response);
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className='w-full xs:mt-4 sm md:mt-4 :mt-4  h-max flex flex-col items-center'>
      <div className="w-full h-24 flex justify-end xs:justify-start sm:justify-start xs:w-[95%] sm:w-[95%] md:w-[85%] xs:ml-0 sm:ml-0 md:justify-start ml-2 w3-container mt-sm-0">
        <div className="container w-[88%] mr-10 xs:min-w-full sm:min-w-full md:min-w-full p-3 border-[1px] ">
          <div className="flex row px-4 items-center w-full justify-between">
            <div className='flex  items-center'>
              <div><img src="../img/point_a.webp" alt="Point A" /> </div>
              <p className='font-bold text-[#34a5e5] ml-2' >
                Origin
              </p>
            </div>
            <div className="font-bold text-[#34a5e5]">
              -
            </div>
            <div className='flex items-center'>
              <p className='font-bold text-[#34a5e5] mr-2' >
                Destination
              </p>
              <div className='w-[100%]'> <img width="8px" src="../img/point_b.webp" alt="Point B" /></div>
            </div>
          </div>
          <div className="px-4 text-sm mt-4">
            <div className="border-t-[1px] flex justify-between">
              <p className='mr-1'>{origin}</p>
              <p className='ml-1'>{destination}</p>
            </div>
          </div>
          <div className="row justify-content-between mt-3 mb-2">
            <div id="origin_txt"></div>
            <div id="distance"></div>
            <div id="destination_txt"></div>
          </div>
        </div>
      </div>

      <div className='w-full flex flex-col items-center justify-center mt-4'>

        <div className="w-[95%] px-2 h-max" >

          <div class="w-[95%] xs:w-[95%] sm:w-[85%] md:w-[85%]">
            <span class="text-base">
              <b>Ooh right!</b>
            </span>
            <br />
            <br />
            <span>
              Your quote has been e-mailed to you. Ready to book?
            </span>
            <br />
            <span>Great!</span>

            <span className='ml-2'>
              <b>NO PAYMENT REQUIRED</b> until your pickup is scheduled.
            </span>
          </div>

          <br />
          <b>Don't know the exact day?</b>
          <br /><br />

          <span className='text-sm'>
            That's ok! You can change at any time with one of our friendly specialists! <a
              href="tel:+14696190747"
            >
              <h5 class="text-primary text-base font-semibold m-0 text-btn-blue mt-4">
                Call now (469) 619-0747
              </h5>
            </a></span>
        </div>

      </div >
    </div >
  );
};

export default ShowDestination;
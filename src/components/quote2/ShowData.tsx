import { getLead } from "../../services/localStorage";
import op from '../../../public/img/op.png'
import inop from '../../../public/img/inop.png'
import truckFlatbed from '../../../public/img/truck-flatbed.svg'
import truck from '../../../public/img/truck.svg'
import type { vehicleTypes } from "../../types/formQuote.type";

const isAnyVehicleInop = (vehicles: vehicleTypes[]) => {
  return vehicles?.some(vehicle => vehicle.vehicle_inop === '0');
};

const ShowDataQuote = () => {
  const lead = getLead()
  const operableStatus = isAnyVehicleInop(lead?.Vehicles) ? 'Inoperable' : 'Operable';

  console.log(lead, operableStatus)
  return (
    <>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] bg-white text-black border border-gray-200 p-2">
        <div className="w-full justify-center"><p className=" font-bold">Customer</p></div>
        <table className="w-full">
          <tbody id="leadInfo">
            <tr>
              <td className="bg-blue-100 p-2">Name</td>
              <td className="text-sm">{lead?.first_name}</td>
            </tr>
            <tr>
              <td className="bg-blue-100 p-2">Email</td>
              <td className="text-sm">{lead?.email}</td>
            </tr>
            <tr>
              <td className="bg-blue-100 p-2">Phone</td>
              <td className="text-sm">{lead?.phone}</td>
            </tr>

          </tbody>
        </table>
      </div>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2">
        <div className="w-full justify-center"><p className=" font-bold">Route</p></div>
        <tr>
          <td className="bg-blue-100 p-2">Origin</td>
          <td className="text-sm ml-2" id="vehicle-list">{lead?.origin_city}</td>
        </tr>
        <tr>
          <td className="bg-blue-100 p-2">Destination</td>
          <td className="text-sm" id="vehicle-list">{lead?.destination_city}</td>
        </tr>
      </div>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2">
        <div className="w-full justify-center"><p className=" font-bold">Vehicles</p></div>

        {lead && Array.isArray(lead.Vehicles) && (
          lead.Vehicles.map((vehicles: vehicleTypes, index: any) => (
            <>
              <tr>
                <td className="bg-blue-100 p-2">Vehicle_model_year_{index + 1}</td>
                <td className="text-sm ml-2" id="vehicle-list">{vehicles.vehicle_model_year}</td>
              </tr>
              <tr>
                <td className="bg-blue-100 p-2">Vehicle_make_{index + 1}</td>
                <td className="text-sm" id="vehicle-list">{vehicles.vehicle_make}</td>
              </tr>
              <tr>
                <td className="bg-blue-100 p-2">Vehicle_model_{index + 1}</td>
                <td className="text-sm" id="vehicle-list">{vehicles.vehicle_model}</td>
              </tr>
              <tr>
                <td className="bg-blue-100 p-2">Vehicle_inop_{index + 1}</td>
                <td className="text-sm" id="vehicle-list">{vehicles.vehicle_inop === '1' ? 'Operable' : 'Inoperable'}</td>
              </tr>
            </>
          ))
        )}
      </div>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2">
        <div className="font-bold justify-center">Trailer</div>
        <table className="w-[95%] " >
          <tbody>
            <tr>
              <td className="p-4">
                <br />
                {lead?.transport_type === '1'
                  ? <img
                    src={truckFlatbed.src}
                    alt=""
                    width="16"
                    height="16"
                    title=""
                    id="transportTypeIcon"
                  />
                  : <img
                    src={truck.src}
                    alt=""
                    width="16"
                    height="16"
                    title=""
                    id="transportTypeIcon"
                  />
                }
                <div id="transportType">
                  {lead?.transport_type === '1' ? 'Open transport' : 'Enclosed transport'}
                </div>
              </td>
              <td>
                <br />
                {operableStatus === 'Operable'
                  ? <img
                    src={op.src}
                    alt=""
                    width="16"
                    height="16"
                    title=""
                    id="inop"
                  />
                  : <img
                    src={inop.src}
                    alt=""
                    width="16"
                    height="16"
                    title=""
                    id="inop"
                  />
                }
                <div id="drives">{operableStatus}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2"
      >
        <table className="w-full ">
          <tbody>
            <tr>
              <td>
                <div className="flex w-full justify-center items-center ">
                  <div className="h-4 w-5">
                    <img
                      src="../img/green_checkbox.webp"
                    />
                  </div>
                  <p>
                    Dedicated Specialists
                  </p>
                </div>
              </td>
              <td>
                <div className="flex items-center">
                  <div className="h-4 w-5">
                    <img
                      src="../img/green_checkbox.webp"
                    />
                  </div>
                  <p>
                    Money back guarantee
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div className="flex w-full justify-center items-center ">
                  <div className="h-4 w-5">
                    <img
                      src="../img/green_checkbox.webp"
                    />
                  </div>
                  <p>
                    Insurance Included
                  </p>
                </div>
              </td>
              <td>
                <div className="flex items-center">
                  <div className="h-4 w-5">
                    <img
                      src="../img/green_checkbox.webp"
                    />
                  </div>
                  <p>
                    Gps Tracking
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div></>
  );
};

export default ShowDataQuote;

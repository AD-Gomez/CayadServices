import { getLead } from "../../services/localStorage";
import op from '../../../public/img/op.webp'
import inop from '../../../public/img/inop.webp'
import truckFlatbed from '../../../public/img/truck-flatbed.svg'
import truck from '../../../public/img/truck.svg'
import type { vehicleTypes } from "../../types/formQuote.type";

const isAnyVehicleInop = (vehicles: vehicleTypes[]) => {
  return vehicles?.some(vehicle => vehicle.vehicle_inop === '0');
};

const ShowDataQuote = () => {
  const lead = getLead()
  const operableStatus = isAnyVehicleInop(lead?.Vehicles) ? 'Operable' : 'Inoperable';

  console.log(lead, operableStatus)
  return (
    <>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] bg-white text-black border border-gray-200 p-2">
        <div className="w-full justify-center"><p className=" font-bold">Customer</p></div>
        <table className="w-full">
          <tbody id="leadInfo">
            <tr>
              <td className="bg-blue-100">Name</td>
              <td className="text-sm">{lead?.first_name}</td>
            </tr>
            <tr>
              <td className="bg-blue-100">Email</td>
              <td className="text-sm">{lead?.email}</td>
            </tr>
            <tr>
              <td className="bg-blue-100">Phone</td>
              <td className="text-sm">{lead?.phone}</td>
            </tr>

          </tbody>
        </table>
      </div>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2">
        <div className="w-full justify-center"><p className=" font-bold">Vehicles</p></div>

        {lead && Array.isArray(lead.Vehicles) && (
          lead.Vehicles.map((vehicles: vehicleTypes) => (
            <tr>
              <td className="bg-blue-100 p-2">Vehicle(s)</td>
              <td className="text-sm" id="vehicle-list">{`${vehicles.vehicle_make}  ${vehicles.vehicle_model}  ${vehicles.vehicle_model_year} ${vehicles.vehicle_inop === '1' ? 'Inoperable' : 'Operable'}`}</td>
            </tr>
          ))
        )}
      </div>
      <div className="w-[95%] xs:w-[95%] sm:w-[95%] md:w-[85%] border-[1px] h-max p-2">

        <div className="font-bold justify-center">Trailer</div>
        <tr className="w-full flex items-center justify-between">
          <td className="p-2">
            {lead?.transport_type === '0'
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
              {lead?.transport_type === '0' ? 'Open transport' : 'Enclosed transport'}
            </div>
          </td>
          <td>
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

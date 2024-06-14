import { getLead } from "../../services/localStorage";
import op from '../../../public/img/op.png'
import inop from '../../../public/img/inop.png'
import truckFlatbed from '../../../public/img/truck-flatbed.svg'
import truck from '../../../public/img/truck.svg'

const ShowDataQuote = () => {
  const lead = getLead()
  console.log(lead)
  return (
    <>
      <div className="w-[95%] xs:w-[80%] sm:w-[85%] md:w-[85%] bg-white text-black border border-gray-200 p-2">
        <table className="w-full">
          <tbody id="leadInfo">
            <tr>
              <td className="bg-blue-100">Pickup From</td>
              <td className="text-sm">{lead?.origin_city}</td>
            </tr>
            <tr>
              <td className="bg-blue-100">Deliver To</td>
              <td className="text-sm">{lead?.destination_city}</td>
            </tr>
            {lead && Array.isArray(lead.Vehicles) && (
              lead.Vehicles.map((vehicles: any) => (
                <tr>
                  <td className="bg-blue-100">Vehicle(s)</td>
                  <td className="text-sm" id="vehicle-list">{`${vehicles.vehicle_make}  ${vehicles.vehicle_model}  ${vehicles.vehicle_model_year}`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="w-[95%] xs:w-[80%] sm:w-[85%] md:w-[85%] border-[1px] h-8"></div>
      <div className="w-[95%] xs:w-[80%] sm:w-[85%] md:w-[85%] border-[1px] h-8"></div>
      <div
        className="w-[95%] xs:w-[80%] sm:w-[85%] md:w-[85%] border-[1px]"
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
                    Dedicated Advisors
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
                    No Hidden Fees
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
                    Customer Portal
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-[95%]" >
          <tbody >
            {lead?.Vehicles && lead.Vehicles?.map((vehicle: any) => (
              <tr>
                <td className="p-4">
                  <br />
                  {lead.transport_type === '1'
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
                  <div id="transportType">{lead.transport_type === '1'
                    ? 'Open transport'
                    : 'Enclosed transport'
                  }</div>
                </td>
                <td>
                  <br />
                  {vehicle.vehicleOperable === '1'
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
                  <div id="drives">{vehicle.vehicleOperable === '1'
                    ? 'Operable'
                    : 'Inoperable'
                  }</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></>
  );
};

export default ShowDataQuote;

import { FaUsers } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi";
import { FaBusinessTime } from "react-icons/fa";
import CountUpComponent from "./Count/CountUpComponent";

const CountNumber = () => {
  return (
    <div
      className="w-1/2 xs:w-full sm:w-full p-2 grid gap-4 grid-cols-2 xs:grid-cols-1"
    >
      <div className="col-sm-6">
        <div className="bg-btn-blue p-4 mb-4 wow fadeIn" data-wow-delay="0.3s">
          <h1 className="text-white text-[5rem]">
            <FaUsers />
          </h1>
          <div className="flex hover:cursor-pointer" >
            <h2
              className="text-white mb-2 text-[2rem] font-semibold "
              data-toggle="counter-up"
            >
              <CountUpComponent start={0} end={15000} duration={2} />
            </h2>
            <h2
              className="text-white mb-2 text-[2rem] font-semibold"
            >
              +
            </h2>
          </div>
          <p className="text-white mb-0">Carriers</p>
        </div>

        <div className="bg-[#51CFED] p-4 wow fadeIn" data-wow-delay="0.5s">
          <h1 className="text-white text-[5rem]">
            <FaBusinessTime />
          </h1>
          <div className="flex hover:cursor-pointer " >
            <h2
              className="text-white mb-2 text-[2rem] font-semibold "
              data-toggle="counter-up"
            >
              <CountUpComponent start={0} end={5000} duration={2} />
            </h2>
            <h2
              className="text-white mb-2 text-[2rem] font-semibold"
            >
              +
            </h2>
          </div>
          <p className="text-white mb-0">Individual Drivers</p>
        </div>
      </div>

      <div className="col-span-">
        <div className="bg-[#198754] p-4 wow fadeIn" data-wow-delay="0.7s">
          <h1 className="text-white text-[5rem]">
            <HiUsers />
          </h1>
          <div className="flex hover:cursor-pointer" >
            <h2
              className="text-white mb-2 text-[2rem] font-semibold "
              data-toggle="counter-up"
            >
              <CountUpComponent start={0} end={250} duration={2} />
            </h2>
            <h2
              className="text-white mb-2 text-[2rem] font-semibold"
            >
              +
            </h2>
          </div>
          <p className="text-white mb-0">Positive Reviews</p>
        </div>
      </div>
    </div>
  );
};

export default CountNumber;

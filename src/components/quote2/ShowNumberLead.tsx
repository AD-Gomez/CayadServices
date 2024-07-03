import { getNumberLead } from "../../services/localStorage";

const ShowNumberLead = () => {
    const lead = getNumberLead()
    console.log(lead)
    return <p className="text-base font-semibold mt-4">Number Lead: {lead}</p>;
};

export default ShowNumberLead;

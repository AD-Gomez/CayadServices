import { getNumberLead } from "../../services/localStorage";

const ShowNumberLead = () => {
    const lead = getNumberLead()
    return <p className="text-base font-bold mt-4">Order ID: {lead}</p>;
};

export default ShowNumberLead;

import { getNumberLead } from "../../services/localStorage";

const ShowNumberLead = () => {
    const lead = getNumberLead();
    if (!lead) return null;
    return (
        <div
            aria-label="Order identifier"
            className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 shadow-sm px-3 py-1.5 text-xs text-slate-700 mb-3"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-sky-600"
            >
                <path d="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75zm2.25-.75a.75.75 0 00-.75.75v10.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75H5.25z" />
                <path d="M7 8.75h5.5a.75.75 0 010 1.5H7a.75.75 0 010-1.5zM7 12h10a.75.75 0 010 1.5H7A.75.75 0 017 12zm0 3.25h10a.75.75 0 010 1.5H7a.75.75 0 010-1.5z" />
            </svg>
            <span className="font-medium">Order ID:</span>
            <span className="font-mono text-slate-900 text-sm">{lead}</span>
        </div>
    );
};

export default ShowNumberLead;

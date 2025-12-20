import { useEffect, useState } from "react";
import { FaStar, FaFacebook, FaStarHalfAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SiTrustpilot } from "react-icons/si";

const badges = [
    {
        id: "google",
        name: "Google",
        rating: "4.7",
        reviews: "5,004 Reviews",
        icon: <FcGoogle className="text-xl" />,
        stars: 4.5,
        color: "text-slate-800",
        bgColor: "bg-white",
    },
    {
        id: "bbb",
        name: "BBB Rating",
        rating: "4.5",
        reviews: "500+ Reviews",
        icon: <img src="/img/BBB_ABSeal_V_7469_US-1675x2488-a905d76 (1).png" alt="BBB" className="h-6 w-auto object-contain" />,
        stars: 4.5,
        color: "text-slate-800",
        bgColor: "bg-white",
    },
    {
        id: "trustpilot",
        name: "Trustpilot",
        rating: "5.0",
        reviews: "500+ Reviews",
        icon: <SiTrustpilot className="text-xl text-[#00b67a]" />,
        stars: 5,
        color: "text-[#00b67a]",
        bgColor: "bg-white",
    },
    {
        id: "facebook",
        name: "Facebook",
        rating: "5.0",
        reviews: "500+ Reviews",
        icon: <FaFacebook className="text-xl text-[#1877F2]" />,
        stars: 5,
        color: "text-[#1877F2]",
        bgColor: "bg-white",
    },
];

function Stars({ count }: { count: number }) {
    const full = Math.floor(count);
    const half = count % 1 >= 0.5;
    return (
        <div className="flex text-yellow-400 text-xs gap-0.5">
            {[...Array(full)].map((_, i) => <FaStar key={i} />)}
            {half && <FaStarHalfAlt />}
        </div>
    );
}

export default function RotatingTrustBadge() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % badges.length);
                setIsAnimating(false);
            }, 300);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const badge = badges[currentIndex];

    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Trusted by thousands</span>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                    }`}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                            {badge.icon}
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${badge.color}`}>{badge.name}</p>
                            <Stars count={badge.stars} />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{badge.rating}</p>
                        <p className="text-[10px] text-slate-400">{badge.reviews}</p>
                    </div>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-3">
                {badges.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setIsAnimating(true);
                            setTimeout(() => {
                                setCurrentIndex(idx);
                                setIsAnimating(false);
                            }, 150);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? "bg-sky-500 w-4"
                            : "bg-slate-300 hover:bg-slate-400"
                            }`}
                        aria-label={`Show ${badges[idx].name} rating`}
                    />
                ))}
            </div>
        </div>
    );
}

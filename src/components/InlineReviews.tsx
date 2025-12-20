import React, { useState, useEffect } from 'react';
import { FaStar, FaGoogle, FaQuoteLeft } from 'react-icons/fa';

// Subset of testimonials for inline display
const inlineTestimonials = [
    {
        name: "Santiago Caceres",
        rating: 5,
        comment: "Alex G at Cayad Auto Transport was amazing to work with. He helps me ship a car from Utah to Idaho without problems and with fair price.",
        source: "google",
    },
    {
        name: "Dave Frankenfield",
        rating: 5,
        comment: "They are very professional. I was a remote buyer of a 1938 jag XX100 roadster... They keep in constant contact, showed up on time and stayed in touch during the transport.",
        source: "google",
    },
    {
        name: "Feng Xue",
        rating: 5,
        comment: "Shipping a car for the first time, I was completely clueless. Fortunately, I came across Cayad and Mr. Maiky, who made everything simple and clear.",
        source: "google",
    },
    {
        name: "Michael Torres",
        rating: 5,
        comment: "Excellent service from start to finish. Communication was great and my vehicle arrived on time and in perfect condition. Highly recommend!",
        source: "google",
    },
    {
        name: "Jennifer Kim",
        rating: 5,
        comment: "I was nervous about shipping my classic car cross-country, but Cayad made the process seamless. Very professional team!",
        source: "google",
    },
];

const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
        {[...Array(rating)].map((_, i) => (
            <FaStar key={i} className="w-3 h-3 text-amber-400" />
        ))}
    </div>
);

interface InlineReviewsProps {
    className?: string;
}

/**
 * InlineReviews - Animated single-review carousel for Step 3 (Almost Done)
 * Shows one review at a time with smooth fade animation. More compact and engaging.
 */
export default function InlineReviews({ className = '' }: InlineReviewsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Rotate reviews every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % inlineTestimonials.length);
                setIsAnimating(false);
            }, 300); // Wait for fade-out before changing
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const review = inlineTestimonials[currentIndex];

    return (
        <div className={`${className}`}>
            {/* Header - compact */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FaGoogle className="text-blue-500 text-sm" />
                    <span className="text-xs font-semibold text-slate-700">What our customers say</span>
                </div>
                {/* Dots indicator */}
                <div className="flex gap-1">
                    {inlineTestimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setIsAnimating(true); setTimeout(() => { setCurrentIndex(idx); setIsAnimating(false); }, 150); }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'bg-sky-500 w-3'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                }`}
                            aria-label={`View review ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Single Review - animated */}
            <div
                className={`bg-white rounded-lg border border-slate-100 p-3 shadow-sm transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                    }`}
            >
                <div className="flex items-start gap-2">
                    <FaQuoteLeft className="text-sky-200 text-sm mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-slate-600 leading-relaxed">
                            {review.comment}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-semibold text-slate-800">{review.name}</span>
                            {renderStars(review.rating)}
                            <FaGoogle className="text-slate-300 text-[10px] ml-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust badge - smaller */}
            <div className="flex items-center justify-center gap-1 pt-2">
                <span className="text-[9px] text-slate-400">Verified 5-star reviews from Google</span>
            </div>
        </div>
    );
}

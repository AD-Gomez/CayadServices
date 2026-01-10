import React from 'react';
// @ts-ignore
import { FaFacebook, FaStar, FaCheckCircle } from 'react-icons/fa';
// @ts-ignore
import { FcGoogle } from 'react-icons/fc';
import type { Review } from '../../data/reviews';

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    // Google's official colors or similar branding
    const isGoogle = review.source === 'Google';

    return (
        <a
            href={review.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full break-inside-avoid mb-6 bg-slate-50 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative border border-transparent hover:border-slate-100"
        >
            <div className="flex flex-col h-full">
                {/* Header: Avatar (if any) + Name + Date */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar Placeholder: Initials with random/preset background */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${isGoogle ? 'bg-orange-500' : 'bg-slate-700'}`}>
                            {review.avatarUrl ? (
                                <img src={review.avatarUrl} alt={review.author} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                review.author.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-slate-900 leading-tight">
                                    {review.author}
                                </h3>
                                {review.verified && (
                                    <div className="relative group/tooltip">
                                        <FaCheckCircle className="text-[#1877F2] w-4 h-4" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Verified Customer
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {review.relativeDate && (
                                <div className="relative group/tooltip-date inline-block">
                                    <p className="text-sm text-slate-400 font-medium cursor-default">
                                        {review.relativeDate}
                                    </p>
                                    <div className="absolute left-0 bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip-date:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                        {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(review.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
                                        <div className="absolute left-4 top-full border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                    {[...Array(review.stars)].map((_, i) => (
                        <FaStar key={i} className="text-[#FABB05] w-5 h-5 drop-shadow-sm" />
                    ))}
                </div>

                {/* Text */}
                <div className="flex-grow">
                    <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-4">
                        {review.text}
                    </p>
                    {review.text.length > 150 && (
                        <span className="text-slate-400 text-sm mt-1 inline-block">Read more</span>
                    )}
                </div>

                {/* Footer: Source Logo */}
                <div className="mt-8 pt-4">
                    <div className="relative group/tooltip-source inline-block">
                        {isGoogle ? (
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6 opacity-90" />
                        ) : (
                            <div className="flex items-center gap-2 text-[#1877F2] font-bold">
                                <FaFacebook className="w-6 h-6" /> Facebook
                            </div>
                        )}
                        <div className="absolute left-0 bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip-source:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                            Posted on {review.source}
                            <div className="absolute left-4 top-full border-4 border-transparent border-t-slate-900"></div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}

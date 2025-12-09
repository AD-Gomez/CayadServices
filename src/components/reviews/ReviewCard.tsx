import React from 'react';
import { FaFacebook, FaStar } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import type { Review } from '../../data/reviews';

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const SourceIcon = review.source === 'Google' ? FcGoogle : FaFacebook;
    const sourceColor = review.source === 'Facebook' ? 'text-[#1877F2]' : '';

    return (
        <a
            href={review.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 mb-6 break-inside-avoid relative overflow-hidden group"
        >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

            {review.title && (
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {review.title}
                </h3>
            )}

            <div className="flex gap-1 mb-3">
                {[...Array(review.stars)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 w-4 h-4" />
                ))}
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                "{review.text}"
            </p>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{review.author}</span>
                        <span className="text-xs text-slate-400">Verified Customer</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1 ${sourceColor}`}>
                    <SourceIcon className="w-5 h-5" />
                    <span className="text-xs font-medium text-slate-500">{review.source}</span>
                </div>
            </div>
        </a>
    );
}

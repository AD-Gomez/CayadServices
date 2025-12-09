import React from 'react';
import ReviewCard from './ReviewCard';
import { reviews } from '../../data/reviews';

export default function ReviewsGrid() {
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 pt-12">
            {reviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
            ))}
        </div>
    );
}

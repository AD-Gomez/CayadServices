import { useEffect, useState, useCallback } from 'react';

// Types for the stats API response
interface RecentCompletion {
    first_name: string;
    origin_city: string;
    origin_state: string;
    destination_city: string;
    destination_state: string;
    completed_at: string;
}

interface LandingStats {
    last_month: {
        bookings: number;
        completed: number;
        quotes: number;
    };
    last_week: {
        bookings: number;
        completed: number;
    };
    recent_completions: RecentCompletion[];
    total_5_star_reviews: number;
    avg_delivery_days: number;
}

// Mock data for development - will be replaced by API call
const mockStats: LandingStats = {
    last_month: {
        bookings: 47,
        completed: 42,
        quotes: 156
    },
    last_week: {
        bookings: 12,
        completed: 9
    },
    recent_completions: [
        {
            first_name: "Carlos",
            origin_city: "Miami",
            origin_state: "FL",
            destination_city: "Los Angeles",
            destination_state: "CA",
            completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            first_name: "Sarah",
            origin_city: "New York",
            origin_state: "NY",
            destination_city: "Houston",
            destination_state: "TX",
            completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            first_name: "Mike",
            origin_city: "Phoenix",
            origin_state: "AZ",
            destination_city: "Seattle",
            destination_state: "WA",
            completed_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
    ],
    total_5_star_reviews: 892,
    avg_delivery_days: 4.2
};

type ProofSlide = {
    type: 'completion' | 'stat';
    content: React.ReactNode;
    icon: React.ReactNode;
};

// Helper to format time ago
const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

const SocialProofMini: React.FC = () => {
    const [stats, setStats] = useState<LandingStats | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [slides, setSlides] = useState<ProofSlide[]>([]);

    // Fetch stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const baseUrl = import.meta.env.PUBLIC_API_URL || '';
                const apiKey = import.meta.env.PUBLIC_API_KEY || '';

                const response = await fetch(`${baseUrl}/api/landing-stats/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch landing stats:', error);
                setStats(mockStats); // Fallback to mock data
            }
        };

        fetchStats();
    }, []);

    // Build slides when stats change
    useEffect(() => {
        if (!stats) return;

        const newSlides: ProofSlide[] = [];

        // Add recent completions
        stats.recent_completions.forEach((completion) => {
            newSlides.push({
                type: 'completion',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                ),
                content: (
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-800">
                            {completion.first_name} • Delivered
                        </span>
                        <span className="text-[10px] text-gray-500">
                            {completion.origin_city}, {completion.origin_state} → {completion.destination_city}, {completion.destination_state}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                            {formatTimeAgo(completion.completed_at)}
                        </span>
                    </div>
                ),
            });
        });

        // Add monthly stats
        newSlides.push({
            type: 'stat',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500">
                    <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                </svg>
            ),
            content: (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-800">
                        This Month's Stats
                    </span>
                    <span className="text-[10px] text-gray-500">
                        <span className="font-semibold text-green-600">{stats.last_month.bookings}</span> bookings • <span className="font-semibold text-blue-600">{stats.last_month.completed}</span> delivered
                    </span>
                </div>
            ),
        });

        // Add weekly stats
        newSlides.push({
            type: 'stat',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-500">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
            ),
            content: (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-800">
                        This Week
                    </span>
                    <span className="text-[10px] text-gray-500">
                        <span className="font-semibold text-green-600">{stats.last_week.bookings}</span> new bookings • <span className="font-semibold text-blue-600">{stats.last_week.completed}</span> completed
                    </span>
                </div>
            ),
        });

        // Add reviews stat
        newSlides.push({
            type: 'stat',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
            ),
            content: (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-800">
                        Trusted Service
                    </span>
                    <span className="text-[10px] text-gray-500">
                        <span className="font-semibold text-yellow-600">{stats.total_5_star_reviews}+</span> 5-star reviews • Avg <span className="font-semibold">{stats.avg_delivery_days}</span> days delivery
                    </span>
                </div>
            ),
        });

        setSlides(newSlides);
    }, [stats]);

    // Show after delay
    useEffect(() => {
        if (isDismissed || slides.length === 0) return;

        // Shorter delay in dev for testing, longer in production
        const delay = import.meta.env.DEV ? 3000 : 15000;

        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(showTimer);
    }, [isDismissed, slides.length]);

    // Rotate slides
    useEffect(() => {
        if (!isVisible || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [isVisible, slides.length]);

    // Auto-hide after showing all slides twice
    useEffect(() => {
        if (!isVisible) return;

        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setIsDismissed(true);
        }, slides.length * 5000 * 2); // Show each slide twice, then hide

        return () => clearTimeout(hideTimer);
    }, [isVisible, slides.length]);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        setIsDismissed(true);
    }, []);

    if (!isVisible || slides.length === 0) return null;

    const currentProof = slides[currentSlide];

    return (
        <div
            className={`
        fixed bottom-4 left-4 z-40
        bg-white/95 backdrop-blur-sm
        rounded-lg shadow-lg border border-gray-100
        px-3 py-2 max-w-[240px]
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
            style={{
                animation: 'slideIn 0.5s ease-out'
            }}
        >
            {/* Close button */}
            <button
                onClick={handleDismiss}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="Dismiss"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-500">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
            </button>

            {/* Content */}
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                    {currentProof.icon}
                </div>
                <div className="flex-1 min-w-0">
                    {currentProof.content}
                </div>
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-1 mt-2">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`
              w-1 h-1 rounded-full transition-all duration-300
              ${idx === currentSlide ? 'bg-blue-500 w-2' : 'bg-gray-300'}
            `}
                    />
                ))}
            </div>

            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default SocialProofMini;

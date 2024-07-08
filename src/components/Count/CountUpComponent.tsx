import React, { useState, useEffect, useRef } from 'react';

interface CountUpComponentProps {
  start?: number;
  end: number;
  duration: number;
}

const CountUpComponent: React.FC<CountUpComponentProps> = ({ start = 0, end, duration }) => {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      });
    }, { threshold: 0.5 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (hasAnimated) {
      const increment = (end - start) / (duration * 1000 / 50);
      const interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount < end) {
            return Math.min(prevCount + increment, end);
          } else {
            clearInterval(interval);
            return prevCount;
          }
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [hasAnimated, start, end, duration]);

  return (
    <div ref={elementRef}>
      <h1>{Math.floor(count)}</h1>
    </div>
  );
};

export default CountUpComponent;

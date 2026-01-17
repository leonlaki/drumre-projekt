import React from 'react';
import { useInView } from 'react-intersection-observer';
import './animatedSection.css'; 

const AnimatedSection = ({ children, className }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px', 
    triggerOnce: true, 
  });

  return (
    <div 
      ref={ref} 
      className={`section-container ${className || ''} ${inView ? 'visible' : 'hidden'}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
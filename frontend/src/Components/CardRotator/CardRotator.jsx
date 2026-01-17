import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './cardRotator.css';
import EventCard from '../EventCard/EventCard'; 

const CardRotator = ({ events }) => {
  
  
  if (!events || events.length === 0) {
    return <div className="rotator-empty">Nema sadržaja za prikaz.</div>;
  }

  return (
    <div className="rotator-wrapper">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        loop={events.length >= 3} 
        slidesPerView={'auto'}
        speed={800}
        
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false,
        }}
        
        watchSlidesProgress={true}
        onProgress={(swiper) => {
            for (let i = 0; i < swiper.slides.length; i++) {
              const slide = swiper.slides[i];
              const slideProgress = slide.progress; 
              const absProgress = Math.abs(slideProgress);
              let newOpacity = 1 - Math.pow(absProgress, 1.5) * 0.5; 
              if (newOpacity < 0.2) newOpacity = 0.2; 
              slide.style.opacity = newOpacity;
            }
        }}
        
        breakpoints={{
            0: { slidesPerView: 1.2 },
            600: { slidesPerView: 2 },
            1000: { slidesPerView: 3 },
            1400: { slidesPerView: 4 }
        }}

        pagination={{ el: '.swiper-pagination', clickable: true }}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="swiper_container"
      >
        {events.map((event) => (
          <SwiperSlide key={event._id}>
             {}
             <div style={{ width: '100%', height: '100%' }}>
                <EventCard event={event} />
             </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardRotator;
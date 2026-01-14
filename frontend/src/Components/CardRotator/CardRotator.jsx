import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './cardRotator.css';
import DinnerCard from '../DinnerCard/DinnerCard';

const CardRotator = () => {
  const navigate = useNavigate();

  const cards = [
    { id: 1, title: 'Steak House', description: 'Best meat in town' },
    { id: 2, title: 'Vegan Delight', description: 'Green & Fresh' },
    { id: 3, title: 'Sushi Bar', description: 'Direct from Japan' },
    { id: 4, title: 'Italian Pizza', description: 'Napoli style' },
    { id: 5, title: 'Burger King', description: 'Juicy burgers' },
    { id: 6, title: 'Taco Mexican', description: 'Spicy & Hot' },
    { id: 7, title: 'Wok & Walk', description: 'Asian Fusion' },
  ];

  return (
    <div className="rotator-wrapper">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        velocityRatio={0.4}
        touchRatio={0.7}
        shortSwipes={false}
        longSwipesRatio={0.3}

        
        
        // --- PROMJENE ZA SMOOTHNESS ---
        speed={800} // Povećano sa 100 na 800ms za glatko zaustavljanje
        slidesPerView={'auto'} // 'auto' je često glađe od fiksnog broja ako imaš breakpointse
        
        // Coverflow postavke za "mekši" 3D osjećaj
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2, // Malo smanjeno sa 2.5
          slideShadows: false,
        }}
        
        // --- CUSTOM OPACITY LOGIKA ---
        watchSlidesProgress={true}
        onProgress={(swiper) => {
            for (let i = 0; i < swiper.slides.length; i++) {
              const slide = swiper.slides[i];
              const slideProgress = slide.progress; 
              const absProgress = Math.abs(slideProgress);

              // Koristimo malo "mekšu" formulu za opacity
              // Umjesto linearne, ovo će dulje zadržati vidljivost blizu centra
              let newOpacity = 1 - Math.pow(absProgress, 1.5) * 0.5; 
              
              if (newOpacity < 0.2) newOpacity = 0.2; 

              slide.style.opacity = newOpacity;
              
              // Opcionalno: Dodatni scale efekt uz coverflow za extra fluidnost
              // slide.style.transform = `scale(${1 - (absProgress * 0.1)})`;
            }
        }}
        
        breakpoints={{
            0: { slidesPerView: 1.5 },
            600: { slidesPerView: 2.5 }, // Malo šire da se vide rubne
            1000: { slidesPerView: 3 }
        }}

        pagination={{ el: '.swiper-pagination', clickable: true }}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="swiper_container"
      >
        {cards.map((item) => (
          <SwiperSlide key={item.id}>
            <DinnerCard data={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardRotator;
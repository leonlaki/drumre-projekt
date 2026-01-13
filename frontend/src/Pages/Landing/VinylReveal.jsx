import React, { useState, useEffect, useRef } from 'react';

const VinylReveal = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // Treba nam referenca samo za gornju sliku (Tanjur) koju crtamo po canvasu
  const plateImageRef = useRef(new Image());
  
  // OVDJE STAVI SVOJE PUTANJE
  // Donja slika je sada GIF (Muzička ploča koja se vrti)
  const vinylGifSrc = "/images/disk1.gif"; 
  // Gornja slika je Tanjur (statična) koja prekriva GIF
  const plateImgSrc = "/images/dish2.png"; 

  useEffect(() => {
    // Učitavamo sliku tanjura
    plateImageRef.current.src = plateImgSrc;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
        if (containerRef.current && canvas) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            
            // Odmah iscrtaj tanjur preko cijelog canvasa (sakrij GIF)
            // Moramo čekati da se slika učita, ali ako je već u cacheu:
            if (plateImageRef.current.complete) {
                ctx.drawImage(plateImageRef.current, 0, 0, width, height);
            } else {
                plateImageRef.current.onload = () => {
                    ctx.drawImage(plateImageRef.current, 0, 0, width, height);
                }
            }
        }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // --- MAGIJA ZA "VODU/MAGLU" KOJA SE VRAĆA ---
    const renderLoop = () => {
      // Svaki frame crtamo sliku tanjura NAZAD preko rupe koju smo napravili
      // ali s jako malim opacity-em. To stvara efekt da se magla polako vraća.
      
      ctx.globalCompositeOperation = 'source-over'; // Normalno crtanje
      
      // OVDJE KONTROLIRAŠ TRAJANJE TRAGA
      // 0.01 = jako sporo nestaje trag (dugo traje)
      // 0.05 = brzo nestaje
      // 0.008 = ekstremno sporo (kao gusta magla)
      ctx.globalAlpha = 0.015; 
      
      // Crtamo tanjur ponovno preko svega
      if (plateImageRef.current.complete) {
         ctx.drawImage(plateImageRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Resetiramo alpha za idući krug
      ctx.globalAlpha = 1.0;
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
  }, [plateImgSrc]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Povećao sam radijus da bude ugodnije
    const radius = 60; 

    // --- EFEKT MEKANOG KISTA (KAO MAGLA) ---
    // Umjesto oštrog kruga, koristimo radijalni gradijent
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    // Sredina je potpuno prozirna (otkriva GIF), rubovi su polu-prozirni
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Jaki pritisak u sredini
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)'); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Mekani rub

    ctx.save();
    // 'destination-out' znači: briši ono što je nacrtano na canvasu (otkrivaj pozadinu)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMouseMove({ 
          clientX: touch.clientX, 
          clientY: touch.clientY 
      });
  }

  return (
    <div ref={containerRef} className="landing-page-reveal-container">
      {/* 1. DONJI SLOJ: GIF (Muzička ploča koja se vrti) */}
      {/* On je skroz vidljiv, ali ga Canvas prekriva */}
      <img 
        src={vinylGifSrc} 
        alt="Vinyl GIF" 
        className="landing-page-reveal-gif"
      />

      {/* 2. GORNJI SLOJ: Canvas (Sadrži sliku Tanjura) */}
      {/* Miš briše ovaj sloj i otkriva GIF ispod */}
      <canvas
        ref={canvasRef}
        className="landing-page-reveal-canvas"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      />
    </div>
  );
};

export default VinylReveal; 
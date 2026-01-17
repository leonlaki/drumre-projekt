import React, { useState, useEffect, useRef } from 'react';

const VinylReveal = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const plateImageRef = useRef(new Image());
  
 
  const vinylGifSrc = "/images/disk1.gif"; 

  const plateImgSrc = "/images/dish2.png"; 

  useEffect(() => {
    
    plateImageRef.current.src = plateImgSrc;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
        if (containerRef.current && canvas) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            
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

    
    const renderLoop = () => {
      
      
      ctx.globalCompositeOperation = 'source-over'; 
      
      
      ctx.globalAlpha = 0.015; 
      
      
      if (plateImageRef.current.complete) {
         ctx.drawImage(plateImageRef.current, 0, 0, canvas.width, canvas.height);
      }

      
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
    
   
    const radius = 60; 

 
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
   
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); 
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)'); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 

    ctx.save();
    
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

      <img 
        src={vinylGifSrc} 
        alt="Vinyl GIF" 
        className="landing-page-reveal-gif"
      />

 
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
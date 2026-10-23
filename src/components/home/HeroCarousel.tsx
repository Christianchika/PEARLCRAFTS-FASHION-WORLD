"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/products/royal-pearl-fascinator.jpg",
    alt: "Elegant pearl fascinator by PEARLCRAFTS FASHION WORLD",
  },
  {
    image: "/products/elegant-bridal-headpiece.jpg",
    alt: "Elegant bridal headpiece by PEARLCRAFTS FASHION WORLD",
  },
  {
    image: "/products/classic-black-fascinator.jpg",
    alt: "Classic black fascinator by PEARLCRAFTS FASHION WORLD",
  },
  {
    image: "/image/hero-image-1.jpg",
    alt: "Hero image 1 by PEARLCRAFTS FASHION WORLD",
  },
];


export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[2rem] shadow-2xl sm:h-[520px] lg:h-[620px]">
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#35102f]/60 via-transparent to-transparent" />
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Show hero image ${index + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
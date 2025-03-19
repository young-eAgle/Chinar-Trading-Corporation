import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const data = [
  {
    title: "Discover Nature",
    description: "Explore the beauty of forests and wildlife.",
    image: "https://via.placeholder.com/600x300?text=Nature+1",
  },
  {
    title: "Serene Beaches",
    description: "Relax by the waves of serene beaches.",
    image: "https://via.placeholder.com/600x300?text=Beach+2",
  },
  {
    title: "Mountain Adventures",
    description: "Hike and climb majestic mountains.",
    image: "https://via.placeholder.com/600x300?text=Mountains+3",
  },
  {
    title: "City Escapes",
    description: "Enjoy vibrant urban experiences.",
    image: "https://via.placeholder.com/600x300?text=City+4",
  },
];

// Loading component
const LoadingSlider = () => (
  <div className="relative max-w-5xl mx-auto p-4">
    <div className="overflow-hidden rounded-2xl bg-gray-200 animate-pulse">
      <div className="w-full h-[300px]"></div>
    </div>
  </div>
);

// Error component
const ErrorSlider = ({ message }) => (
  <div className="relative max-w-5xl mx-auto p-4">
    <div className="overflow-hidden rounded-2xl bg-red-50 p-8 text-center">
      <div className="text-red-600 text-xl mb-2">⚠️</div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Navigation Arrow component
const NavigationArrow = ({ direction, onClick, disabled }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    disabled={disabled}
    className={`absolute top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${direction === 'left' ? 'left-4' : 'right-4'}`}
    aria-label={`${direction === 'left' ? 'Previous' : 'Next'} slide`}
  >
    {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
  </motion.button>
);

// Dots Navigation component
const DotsNavigation = ({ total, current, onDotClick }) => (
  <div className="flex justify-center mt-4 space-x-2">
    {Array.from({ length: total }).map((_, index) => (
      <motion.button
        key={index}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDotClick(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          current === index ? "bg-blue-600 scale-125" : "bg-gray-400 hover:bg-gray-600"
        }`}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>
);

// Slide Content component
const SlideContent = ({ slide, index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.5 }}
    className="relative w-full"
  >
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold mb-2"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm md:text-base text-gray-200"
        >
          {slide.description}
        </motion.p>
      </div>
    </div>
  </motion.div>
);

const CustomSlider = memo(({ data = [], autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const slideInterval = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
  };

  const startAutoSlide = () => {
    if (autoPlay) {
      slideInterval.current = setInterval(nextSlide, interval);
    }
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  useEffect(() => {
    const loadSlider = async () => {
      try {
        setIsLoading(true);
        if (!data || data.length === 0) {
          throw new Error("No slides data provided");
        }
        startAutoSlide();
      } catch (err) {
        setError(err.message || "Failed to load slider");
        console.error("Error loading slider:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlider();
    return stopAutoSlide;
  }, [data, autoPlay, interval]);

  if (isLoading) return <LoadingSlider />;
  if (error) return <ErrorSlider message={error} />;
  if (!data || data.length === 0) return null;

  return (
    <div className="relative max-w-5xl mx-auto p-4">
      {/* Slider Content */}
      <div 
        className="overflow-hidden rounded-2xl shadow-xl"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
      >
        <AnimatePresence mode="wait">
          <SlideContent slide={data[currentIndex]} index={currentIndex} />
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <NavigationArrow
        direction="left"
        onClick={prevSlide}
        disabled={currentIndex === 0}
      />
      <NavigationArrow
        direction="right"
        onClick={nextSlide}
        disabled={currentIndex === data.length - 1}
      />

      {/* Dots Navigation */}
      <DotsNavigation
        total={data.length}
        current={currentIndex}
        onDotClick={setCurrentIndex}
      />
    </div>
  );
});

CustomSlider.displayName = 'CustomSlider';

export default CustomSlider;

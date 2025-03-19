import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Lazy load components
const Banner = lazy(() => import('../Home Banners/banner'));
const Categories = lazy(() => import('../../components/ProductCategories'));
const ProductSection = lazy(() => import('../gysers/gysers'));
const KitchenBanner = lazy(() => import('../kitchen_banner'));
const RollingLogos = lazy(() => import('../RollingLogos'));
const FeaturedProducts = lazy(() => import('../home/FeaturedProducts'));
const SpecialOffers = lazy(() => import('../home/SpecialOffers'));
const Newsletter = lazy(() => import('./Newsletter'));

// Loading components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const SectionWrapper = ({ children, className = '' }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`py-8 md:py-12 ${className}`}
  >
    {children}
  </motion.section>
);

const HomePage = () => {
  // Fetch categories data
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('http://46.202.166.65/categories');
      return response.data;
    },
  });

  // Category sections configuration
  const categorySections = [
    { title: 'LED TV\'s', categoryId: "67afffa3e4667bfb97e2b24f" },
    { title: 'Air Conditioner', categoryId: "67afffa3e4667bfb97e2b24d" },
    { title: 'Geysers', categoryId: "67afffa3e4667bfb97e2b24e" },
    { title: 'Refrigerators', categoryId: "67affa77cf40bd9eb2b13285" },
    { title: 'Washing Machine', categoryId: "67afffa3e4667bfb97e2b252" },
    { title: 'Water Dispensar', categoryId: "67afffa3e4667bfb97e2b250" },
    { title: 'Iron & Garment Steamer', categoryId: "67afffa3e4667bfb97e2b257" },
    { title: 'Personal Care', categoryId: "67afffa3e4667bfb97e2b255" },
    { title: 'Microwave Oven', categoryId: "67afffa3e4667bfb97e2b258" },
    { title: 'Dishwasher', categoryId: "67afffa3e4667bfb97e2b25d" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <Banner />
      </Suspense>

      {/* Categories Section */}
      <SectionWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <Categories />
        </Suspense>
      </SectionWrapper>

      {/* Featured Products */}
      <SectionWrapper className="bg-gray-50">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedProducts />
        </Suspense>
      </SectionWrapper>

      {/* Special Offers */}
      <SectionWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <SpecialOffers />
        </Suspense>
      </SectionWrapper>

      {/* Category Sections */}
      {categorySections.map((section, index) => (
        <SectionWrapper key={section.categoryId}>
          <Suspense fallback={<LoadingSpinner />}>
            <ProductSection 
              title={section.title} 
              categoryId={section.categoryId}
            />
          </Suspense>
        </SectionWrapper>
      ))}

      {/* Kitchen Banner */}
      <SectionWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <KitchenBanner />
        </Suspense>
      </SectionWrapper>

      {/* Brand Logos */}
      {/* <SectionWrapper className="bg-gray-50">
        <Suspense fallback={<LoadingSpinner />}>
          <RollingLogos />
        </Suspense>
      </SectionWrapper> */}

      {/* Newsletter Section */}
      <SectionWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <Newsletter />
        </Suspense>
      </SectionWrapper>
    </div>
  );
};

export default HomePage;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTag, FaClock } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const SpecialOffers = () => {
  const { data: specialOffers, isLoading, error } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const response = await axios.get( `${API_URL}/api/home/special-offers`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load special offers. Please try again later.
      </div>
    );
  }

  if (!specialOffers?.length) {
    return null;
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Special Offers
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Limited time deals you don't want to miss
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialOffers.map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={offer.imageUrl}
                  alt={offer.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {offer.discount}% OFF
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {offer.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-500 line-through">
                      ${offer.actualPrice}
                    </span>
                    <span className="ml-2 text-xl font-bold text-red-600">
                      ${offer.discountedPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1" />
                    <span>
                      {new Date(offer.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/product/${offer._id}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  View Deal
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers; 
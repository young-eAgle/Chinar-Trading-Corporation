import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const OrderTimeline = ({ timeline }) => {
  const getStatusIcon = (type, status) => {
    switch (type) {
      case 'status':
        switch (status) {
          case 'Delivered':
            return <FaCheckCircle className="text-green-500" />;
          case 'Cancelled':
            return <FaTimesCircle className="text-red-500" />;
          case 'Shipped':
            return <FaTruck className="text-blue-500" />;
          default:
            return <FaClock className="text-yellow-500" />;
        }
      case 'communication':
        return <FaEnvelope className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (type, status) => {
    switch (type) {
      case 'status':
        switch (status) {
          case 'Delivered':
            return 'bg-green-100 text-green-800';
          case 'Cancelled':
            return 'bg-red-100 text-red-800';
          case 'Shipped':
            return 'bg-blue-100 text-blue-800';
          default:
            return 'bg-yellow-100 text-yellow-800';
        }
      case 'communication':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {timeline.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-12"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center">
              {getStatusIcon(item.type, item.status)}
            </div>

            {/* Timeline content */}
            <div className={`p-4 rounded-lg ${getStatusColor(item.type, item.status)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">
                    {item.type === 'status' ? item.status : item.subject}
                  </h4>
                  <p className="text-sm mt-1">{item.note || item.content}</p>
                  {item.location && (
                    <p className="text-sm mt-1 text-gray-600">
                      Location: {item.location}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              {item.updatedBy && (
                <p className="text-sm mt-2 text-gray-600">
                  Updated by: {item.updatedBy.name}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline; 
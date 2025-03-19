import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const ShippingTracking = ({ order, onUpdateTracking, onUpdateStatus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: order.shipping?.carrier || '',
    trackingNumber: order.shipping?.trackingNumber || '',
    estimatedDelivery: order.shipping?.estimatedDelivery || '',
    shippingCost: order.shipping?.shippingCost || '',
    shippingMethod: order.shipping?.shippingMethod || ''
  });

  const [newStatus, setNewStatus] = useState({
    status: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdateTracking(trackingInfo);
    setIsEditing(false);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    await onUpdateStatus(newStatus);
    setNewStatus({ status: '', location: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Shipping & Tracking</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEditing ? 'Cancel' : 'Edit Tracking Info'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Carrier</label>
              <input
                type="text"
                value={trackingInfo.carrier}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
              <input
                type="text"
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Delivery</label>
              <input
                type="datetime-local"
                value={trackingInfo.estimatedDelivery}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, estimatedDelivery: e.target.value })}
                className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Cost</label>
              <input
                type="number"
                value={trackingInfo.shippingCost}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, shippingCost: e.target.value })}
                className="mt-1  p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Method</label>
              <input
                type="text"
                value={trackingInfo.shippingMethod}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, shippingMethod: e.target.value })}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button
            disabled
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update Tracking Info
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <FaTruck className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Carrier</p>
                <p className="font-medium">{order.shipping?.carrier || 'Not set'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-medium">{order.shipping?.trackingNumber || 'Not set'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium">
                  {order.shipping?.estimatedDelivery
                    ? new Date(order.shipping.estimatedDelivery).toLocaleString()
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shipping Cost</p>
              <p className="font-medium">Rs.{order.shipping?.shippingCost || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shipping Method</p>
              <p className="font-medium">{order.shipping?.shippingMethod || 'Not set'}</p>
            </div>
          </div>

          {/* Tracking History */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Tracking History</h4>
            <div className="space-y-4">
              {order.shipping?.trackingHistory?.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <FaMapMarkerAlt className="text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">{entry.status}</p>
                    <p className="text-sm text-gray-600">{entry.location}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Add New Tracking Status */}
          <form onSubmit={handleStatusUpdate} className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold">Add Tracking Update</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input
                  type="text"
                  value={newStatus.status}
                  onChange={(e) => setNewStatus({ ...newStatus, status: e.target.value })}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., In Transit"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={newStatus.location}
                  onChange={(e) => setNewStatus({ ...newStatus, location: e.target.value })}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Tracking Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShippingTracking; 
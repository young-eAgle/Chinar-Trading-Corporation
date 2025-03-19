import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CustomerCommunication = ({ order, onSendCommunication }) => {
  const [isSending, setIsSending] = useState(false);
  const [communication, setCommunication] = useState({
    type: 'email',
    subject: '',
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSendCommunication(communication);
      setCommunication({
        type: 'email',
        subject: '',
        content: ''
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Customer Communication</h3>

      {/* Communication History */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold">Communication History</h4>
        {order.communications?.map((comm, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <FaEnvelope className={`text-${
                  comm.type === 'email' ? 'blue' : comm.type === 'sms' ? 'green' : 'gray'
                }-500`} />
                <div>
                  <p className="font-medium">{comm.subject}</p>
                  <p className="text-sm text-gray-600">{comm.content}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {new Date(comm.timestamp).toLocaleString()}
                </span>
                {comm.status === 'sent' ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Send New Communication */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-lg font-semibold">Send New Communication</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={communication.type}
            onChange={(e) => setCommunication({ ...communication, type: e.target.value })}
            className="mt-1 sm:p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="system">System Notification</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={communication.subject}
            onChange={(e) => setCommunication({ ...communication, subject: e.target.value })}
            className="mt-1 sm:p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={communication.content}
            onChange={(e) => setCommunication({ ...communication, content: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
        disabled
          type="submit"
          // disabled={isSending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center space-x-2"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FaPaperPlane />
              <span>Send Communication</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerCommunication; 
import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

// Loading component
const LoadingChat = () => (
  <div className="fixed bottom-36 right-4 bg-white w-80 p-4 shadow-lg rounded-lg border border-gray-200 z-[999999] animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

// Error component
const ErrorChat = ({ message, onRetry }) => (
  <div className="fixed bottom-36 right-4 bg-white w-80 p-4 shadow-lg rounded-lg border border-gray-200 z-[999999]">
    <div className="text-red-600 text-xl mb-2">⚠️</div>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="w-full bg-red-500 text-white text-center py-2 rounded-md shadow-md hover:bg-red-600 transition"
    >
      Retry
    </button>
  </div>
);

// Chat Header component
const ChatHeader = ({ onClose }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <FaWhatsapp className="text-green-500 text-xl" />
      <h4 className="text-lg font-semibold text-gray-700">Chat with us</h4>
    </div>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      className="text-gray-500 hover:text-gray-700 transition-colors"
      aria-label="Close chat"
    >
      <IoClose size={24} />
    </motion.button>
  </div>
);

// Chat Content component
const ChatContent = ({ onStartChat }) => (
  <div className="space-y-4">
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">
        Hi! How can we assist you today? Our support team is available to help you with:
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
        <li>• Product information</li>
        <li>• Order status</li>
        <li>• Technical support</li>
        <li>• General inquiries</li>
      </ul>
    </div>
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href="https://wa.me/923173336141?text=Hello%20Support,%20I%20need%20assistance."
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-green-500 text-white text-center py-3 rounded-md shadow-md hover:bg-green-600 transition-all duration-300"
      onClick={onStartChat}
    >
      Start WhatsApp Chat
    </motion.a>
  </div>
);

const WhatsAppChat = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has interacted with chat before
    const hasInteractedBefore = localStorage.getItem('whatsappChatInteracted');
    if (hasInteractedBefore) {
      setHasInteracted(true);
    }
  }, []);

  const handleOpen = () => {
    try {
      setIsLoading(true);
      setIsOpen(true);
      setHasInteracted(true);
      localStorage.setItem('whatsappChatInteracted', 'true');
    } catch (err) {
      setError("Failed to open chat. Please try again.");
      console.error("Error opening chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStartChat = () => {
    // Track chat initiation
    try {
      // You can add analytics tracking here
      console.log("Chat initiated");
    } catch (err) {
      console.error("Error tracking chat initiation:", err);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleOpen();
  };

  return (
    <div className="fixed bottom-0 right-0 z-[999999]">
      {/* Floating WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="fixed cursor-pointer bottom-20 right-5 w-14 h-14 bg-green-500 text-white flex justify-center items-center rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
        aria-label="Open WhatsApp chat"
      >
        <FaWhatsapp size={28} />
      </motion.button>

      {/* Chatbox Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-36 right-4 bg-white w-80 p-4 shadow-lg rounded-lg border border-gray-200"
          >
            {isLoading ? (
              <LoadingChat />
            ) : error ? (
              <ErrorChat message={error} onRetry={handleRetry} />
            ) : (
              <>
                <ChatHeader onClose={handleClose} />
                <ChatContent onStartChat={handleStartChat} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

WhatsAppChat.displayName = 'WhatsAppChat';

export default WhatsAppChat;

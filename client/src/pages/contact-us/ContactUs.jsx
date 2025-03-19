import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-gray-100 text-gray-800 mt-35">
      {/* Hero Section */}
      <section className="text-center py-20 bg-green-600 text-white">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Have questions or want to work with us? Get in touch!
        </p>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-semibold mb-6">Get in Touch</h2>
          {submitted ? (
            <p className="text-green-600 text-lg">Thank you for your message! We will get back to you soon.</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                className="w-full p-3 border rounded-lg" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                className="w-full p-3 border rounded-lg" 
                value={formData.email} 
                onChange={handleChange}
                required
              />
              <textarea 
                name="message" 
                placeholder="Your Message" 
                className="w-full p-3 border rounded-lg h-32" 
                value={formData.message} 
                onChange={handleChange}
                required
              ></textarea>
              <button 
                type="submit" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contact Details */}
      <section className="py-16 bg-gray-200 text-center">
        <h2 className="text-3xl font-semibold mb-6">Contact Information</h2>
        <p className="text-lg">📍 123 Business Street, City, Country</p>
        <p className="text-lg">📞 +1 234 567 890</p>
        <p className="text-lg">✉️ contact@company.com</p>
      </section>
    </div>
  );
}

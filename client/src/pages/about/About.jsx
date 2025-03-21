export default function AboutUs() {
  let staff = [
    { id:1,
      name:"Sajjad Abbasi",
      job : "C.E.O",
      img : ""
    },
    { id:2,
      name:"Asif Razza",
      job : "Full Stack Developer",
      img : "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742527155/WhatsApp_Image_2024-11-13_at_7.45.13_PM_r5r6ie.jpg"
    },
    { id:3,
      name:"Muhammad Shabbir",
      job : "Oracle Apex Developer ",
      img : "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742527537/shabbir_shb_wcnn0q.png"
    },
  ]
  return (
    <div className="bg-gray-100 text-gray-800 mt-35">
      {/* Hero Section */}
      <section className="text-center py-20 bg-blue-600 text-white">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-lg max-w-2xl mx-auto">
          We are a passionate team dedicated to delivering the best products for our customers.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
          <p className="text-lg mb-6">
            To innovate and provide top-notch services that empower businesses worldwide.
          </p>
          <h2 className="text-3xl font-semibold mb-6">Our Vision</h2>
          <p className="text-lg">
            Creating a future where technology seamlessly enhances everyday life.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {staff.map((staff, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-xl text-center">
              <img src={staff.img} className="w-24 h-24 object-cover bg-gray-400 rounded-full object-top mx-auto mb-4"></img>
              <h3 className="text-xl font-semibold">{staff.name}</h3>
              <p className="text-gray-600">{staff.job}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">Join Our Journey</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Be a part of our story and let’s create something amazing together!
        </p>
       <a href="/contact us"> <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
          Contact Us
        </button></a>
      </section>
    </div>
  );
}

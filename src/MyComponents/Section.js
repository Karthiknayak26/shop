import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../App.css"; // Ensure this includes the custom styles
import { useNavigate } from 'react-router-dom'



const Section = () => {
  const navigate = useNavigate();
  const cards = [
    {
      id: "1",  // Added ID for selection
      title: "Energy Drinks",
      price: "20.99",
      description: "A refreshing energy drink to keep you charged throughout the day.",
      discount: "15",
      discountType: "Min.",
      bgColor: "bg-gradient-purple", // Gradient background
      buttonText: "Shop Now",
      image: "./Header/1.png", // Replace with your energy drinks image
      bgClass: "bg-energy-drinks",
    },
    {
      id: "2",  // Added ID for selection
      title: "Glam Up Range",
      price: "49.99",
      description: "Makeup and skincare essentials for your glam look.",
      discount: "50",
      discountType: "FLAT",
      bgColor: "bg-gradient-pink", // Gradient background
      buttonText: "Shop Now",
      image: "./Header/1.png", // Replace with your glam products image
      bgClass: "bg-glam-up",
    },
    {
      title: "Perfumes & Deodorants",
      discount: "50",
      discountType: "FLAT",
      bgColor: "bg-gradient-cyan", // Gradient background
      buttonText: "Shop Now",
      image: "./Header/1.png", // Replace with your perfumes image
      bgClass: "bg-perfumes", // Unique class for background image
    },
    {
      title: "Health Essentials",
      discount: "20",
      discountType: "Min.",
      bgColor: "bg-gradient-orange", // Gradient background
      buttonText: "Shop Now",
      image: "./Header/1.png", // Replace with your health essentials image
      bgClass: "bg-health-essentials", // Unique class for background image
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700, // Slightly increased for smoother transition
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000, // Increased to 4 seconds
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleProductClick = (id) => {
    // Navigate to the product details page using useNavigate
    navigate(`/product/${id}`);

    // Alternatively, you can show a modal or product details on the same page
    // Example: showProductDetails(id);
  };

  return (
    <section className="w-full py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <Slider {...sliderSettings}>
          {cards.map((card, index) => (
            <div key={index} className="px-3">
              <div
                className={`group ${card.bgColor} rounded-3xl overflow-hidden relative p-6 h-[320px] flex flex-col shadow-2xl transition-transform duration-500 ${card.bgClass}`}
              >
                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 transition-colors duration-300 group-hover:text-indigo-600">
                  {card.title}
                </h2>

                {/* Discount Badge */}
                <div className="absolute top-6 left-6">
                  <div
                    className={`
                      rounded-full p-4 text-white text-center transition-transform duration-300 transform group-hover:scale-110
                      ${index === 0
                        ? "bg-purple-600"
                        : index === 1
                          ? "bg-pink-500"
                          : index === 2
                            ? "bg-teal-500"
                            : "bg-orange-500"
                      }
                    `}
                  >
                    <div className="text-xs">{card.discountType}</div>
                    <div className="text-xl font-bold">{card.discount}%</div>
                    <div className="text-xs">OFF</div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="absolute right-4 bottom-4 w-40 h-40 transition-transform duration-500 transform group-hover:rotate-12 group-hover:scale-125">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>



                {/* Shop Now Button */}
                <button className="mt-auto bg-black text-gray-800 px-6 py-3 rounded-full w-full button-hover text-lg font-semibold" onClick={() => handleProductClick(card.id)} >
                  {card.buttonText}
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Section;

// Section.js

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import "./section.css"; // Make sure to import the new CSS file


const Section = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: "1",
      title: "GROCERYS",
      buttonText: "Shop Now",

      bgClass: "bg-energy-drinks",

    },
    {
      id: "2",
      title: "ELECTRONICS",
      buttonText: "Shop Now",
      // image: "./Header/2.png",
      bgClass: "bg-glam-up",

    },
    {
      title: "HOMESTYLE AND APLIANCES",
      buttonText: "Shop Now",
      // image: "../MyComponents/Header/1.png",
      bgClass: "bg-electronics",

    },
    {
      title: "Health Essentials",
      buttonText: "Shop Now",
      bgClass: "bg-health-essentials",

    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
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

  const handleProductClick = (title) => {
    // Determine which products page to navigate to based on the banner title
    let route = '';
    let productsGridId = '';

    switch (title) {
      case "GROCERYS":
        route = '/groceries/products'; // Go directly to grocery products page
        productsGridId = 'grocery-products-grid';
        break;
      case "HOMESTYLE AND APLIANCES":
        route = '/homelifestyles/products'; // Go directly to homelifestyle products page
        productsGridId = 'homestyle-products-grid';
        break;
      case "ELECTRONICS":
        route = '/electronics/products'; // Go directly to electronics products page
        productsGridId = 'electronics-products-grid';
        break;
      default:
        route = '/groceries/products';
        productsGridId = 'grocery-products-grid';
        break;
    }

    // Navigate directly to the products page where items can be added to cart
    navigate(route);

    // After navigation, scroll to the products grid
    setTimeout(() => {
      const productsGrid = document.getElementById(productsGridId);
      if (productsGrid) {
        // Find the first product card within the grid
        const firstProductCard = productsGrid.querySelector('.product-card');
        if (firstProductCard) {
          // Scroll to the first product card, ensuring it's clearly visible
          firstProductCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } else {
          // Fallback: if no product card found, scroll to the products grid
          productsGrid.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } else {
        // Fallback: look for any products grid on the page
        const anyProductsGrid = document.querySelector('.products-grid');
        if (anyProductsGrid) {
          const firstProductCard = anyProductsGrid.querySelector('.product-card');
          if (firstProductCard) {
            firstProductCard.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          } else {
            anyProductsGrid.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    }, 500); // Increased delay to ensure page navigation completes
  };

  return (
    <>
      <section className="w-full py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <Slider {...sliderSettings}>
            {cards.map((card, index) => (
              <div
                key={index}
                className="px-3 card-container cursor-pointer"
                onClick={() => handleProductClick(card.title)}
              >
                <div className={`group h-[320px] w-full rounded-3xl overflow-hidden relative p-6 flex flex-col shadow-2xl ${card.bgClass} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
                  {/* Title */}
                  <h2 className="card-title text-2xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                    {card.title}
                  </h2>

                  {/* Shop Now Button */}
                  <button
                    className="shop-button mt-auto text-white px-6 py-3 rounded-full w-full text-lg font-semibold shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,rgb(237, 123, 52) 0%,rgb(130, 158, 235) 100%)', border: 'none' }}
                  >
                    {card.buttonText} <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </>
  );
};

export default Section;
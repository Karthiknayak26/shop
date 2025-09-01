// Section.js

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import "./section.css";

const Section = () => {
  const navigate = useNavigate();

  const cards = [
    { id: "1", title: "GROCERYS", bgClass: "bg-energy-drinks" },
    { id: "2", title: "ELECTRONICS", bgClass: "bg-glam-up" },
    { id: "3", title: "HOMESTYLE AND APLIANCES", bgClass: "bg-electronics" },
    { id: "4", title: "Health Essentials", bgClass: "bg-health-essentials" },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: "0px",
        },
      },
    ],
  };

  const handleProductClick = (title) => {
    let route = "";

    switch (title) {
      case "GROCERYS":
        route = "/groceries/products";
        break;
      case "HOMESTYLE AND APLIANCES":
        route = "/homelifestyles/products";
        break;
      case "ELECTRONICS":
        route = "/electronics/products";
        break;
      default:
        route = "/groceries/products";
        break;
    }

    navigate(route);
  };

  return (
    <section className="w-full py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <Slider {...sliderSettings}>
          {cards.map((card, index) => (
            <div
              key={index}
              className="card-container cursor-pointer w-full"
              onClick={() => handleProductClick(card.title)}
            >
              <div className={`group ${card.bgClass}`}>
                {/* Title pinned top-left */}
                <h2 className="card-title">{card.title}</h2>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Section;

import React from "react";
import "./Home.css";

function Homelifestyle() {
  const deals = [
    { category: "Biscuits & Rusk", discount: "Up To 50% Off", img: "url-to-image" },
    { category: "Tea & Coffee", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Cold Drinks & Juices", discount: "Up To 25% Off", img: "url-to-image" },
    { category: "Detergent Liquids", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Oral Care", discount: "Up To 50% Off", img: "url-to-image" },
    { category: "Soaps & Shampoo", discount: "Up To 50% Off", img: "url-to-image" },
    { category: "Grains", discount: "Up To 40% Off", img: "url-to-image" },
    { category: "Cooking Oil", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Nuts & Dry Fruits", discount: "Up To 30% Off", img: "url-to-image" },
  ];

  return (
    <div className="Home">
      <header>
        <h1>BEST DEALS ON HOME AND LIFESTYLES</h1>
      </header>
      <div className="deals-grid">
        {deals.map((deal, index) => (
          <div className="deal-card" key={index}>
            <img src={deal.img} alt={deal.category} />
            <h3>{deal.discount}</h3>
            <p>{deal.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homelifestyle;
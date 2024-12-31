import React from "react";
import "./grocery-deals.css";

function GroceryDeals() {
  const deals = [
    { category: "Biscuits & Packaged foods", discount: "Up To 50% Off", img: "./image/download.jpeg" },
    { category: "cooking essentials", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Frozen Products", discount: "Up To 25% Off", img: "url-to-image" },
    { category: "Baby Care", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Personal Care", discount: "Up To 50% Off", img: "url-to-image" },
    { category: "Home care", discount: "Up To 50% Off", img: "url-to-image" },
    { category: "KitchenWare", discount: "Up To 40% Off", img: "url-to-image" },
    { category: "Disposables", discount: "Up To 30% Off", img: "url-to-image" },
    { category: "Stationary", discount: "Up To 30% Off", img: "url-to-image" },
  ];

  return (
    <div className="grocery-deals">
      <header>
        <h1>Best Deals On Grocery</h1>
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

export default GroceryDeals;





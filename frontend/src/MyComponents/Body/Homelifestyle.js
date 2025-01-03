import React from "react";
import "./Home.css";

function Homelifestyle() {
  const deals = [
    { category: "Biscuits & Rusk", discount: "Up To 50% Off", img: "url-to-image", link: "/category/biscuits-rusk" },
    { category: "Tea & Coffee", discount: "Up To 30% Off", img: "url-to-image", link: "/category/tea-coffee" },
    { category: "Cold Drinks & Juices", discount: "Up To 25% Off", img: "url-to-image", link: "/category/cold-drinks-juices" },
    { category: "Detergent Liquids", discount: "Up To 30% Off", img: "url-to-image", link: "/category/detergent-liquids" },
    { category: "Oral Care", discount: "Up To 50% Off", img: "url-to-image", link: "/category/oral-care" },
    { category: "Soaps & Shampoo", discount: "Up To 50% Off", img: "url-to-image", link: "/category/soaps-shampoo" },
    { category: "Grains", discount: "Up To 40% Off", img: "url-to-image", link: "/category/grains" },
    { category: "Cooking Oil", discount: "Up To 30% Off", img: "url-to-image", link: "/category/cooking-oil" },
    { category: "Nuts & Dry Fruits", discount: "Up To 30% Off", img: "url-to-image", link: "/category/nuts-dry-fruits" },
  ];

  return (
    <div className="Home">
      <header>
        <h1>BEST DEALS ON HOME AND LIFESTYLES</h1>
      </header>
      <div className="deals-grid">
        {deals.map((deal, index) => (
          <div className="deal-card" key={index}>
            <a href={deal.link}>
              <img src={deal.img} alt={deal.category} />
              <h3>{deal.discount}</h3>
              <p>{deal.category}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homelifestyle;
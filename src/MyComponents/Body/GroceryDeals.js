
import React from "react";
import "./grocery-deals.css";
function GroceryDeals() {
  const deals = [
    { category: "Biscuits & Packaged foods", discount: "Up To 50% Off", img: "./image/download.jpeg", link: "/category/biscuits" },
    { category: "Cooking Essentials", discount: "Up To 30% Off", img: "url-to-image", link: "/category/cooking-essentials" },
    { category: "Frozen Products", discount: "Up To 25% Off", img: "url-to-image", link: "/category/frozen-products" },
    { category: "Baby Care", discount: "Up To 30% Off", img: "url-to-image", link: "/category/baby-care" },
    { category: "Personal Care", discount: "Up To 50% Off", img: "url-to-image", link: "/category/personal-care" },
    { category: "Home Care", discount: "Up To 50% Off", img: "url-to-image", link: "/category/home-care" },
    { category: "Kitchenware", discount: "Up To 40% Off", img: "url-to-image", link: "/category/kitchenware" },
    { category: "Disposables", discount: "Up To 30% Off", img: "url-to-image", link: "/category/disposables" },
    { category: "Stationery", discount: "Up To 30% Off", img: "url-to-image", link: "/category/stationery" },
  ];



  return (
    <>

      <div className="grocery-deals">
        <header>
          <h1>Best Deals On Grocery</h1>
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
    </>
  );
}

export default GroceryDeals;
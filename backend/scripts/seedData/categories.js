/**
 * Categories seed data for Kandukuru Supermarket
 * Tailored for Indian supermarket needs
 */

module.exports = [
  // Main Categories
  {
    name: 'Groceries',
    description: 'Essential food items and daily groceries',
    icon: 'shopping-cart',
    image: '/images/categories/groceries.jpg',
    isFeatured: true,
    displayOrder: 1,
    colors: {
      primary: '#4CAF50',
      secondary: '#E8F5E8'
    }
  },
  {
    name: 'Fresh Vegetables',
    description: 'Farm-fresh vegetables delivered daily',
    icon: 'leaf',
    image: '/images/categories/vegetables.jpg',
    isFeatured: true,
    displayOrder: 2,
    colors: {
      primary: '#8BC34A',
      secondary: '#F1F8E9'
    }
  },
  {
    name: 'Fresh Fruits',
    description: 'Seasonal and fresh fruits',
    icon: 'apple',
    image: '/images/categories/fruits.jpg',
    isFeatured: true,
    displayOrder: 3,
    colors: {
      primary: '#FF9800',
      secondary: '#FFF3E0'
    }
  },
  {
    name: 'Dairy & Eggs',
    description: 'Fresh dairy products and farm eggs',
    icon: 'milk',
    image: '/images/categories/dairy.jpg',
    isFeatured: true,
    displayOrder: 4,
    colors: {
      primary: '#2196F3',
      secondary: '#E3F2FD'
    }
  },
  {
    name: 'Meat & Seafood',
    description: 'Fresh meat and seafood',
    icon: 'fish',
    image: '/images/categories/meat.jpg',
    displayOrder: 5,
    colors: {
      primary: '#F44336',
      secondary: '#FFEBEE'
    }
  },
  {
    name: 'Bakery',
    description: 'Fresh bread, cakes, and baked goods',
    icon: 'bread',
    image: '/images/categories/bakery.jpg',
    displayOrder: 6,
    colors: {
      primary: '#795548',
      secondary: '#EFEBE9'
    }
  },
  {
    name: 'Beverages',
    description: 'Drinks, juices, and beverages',
    icon: 'drink',
    image: '/images/categories/beverages.jpg',
    displayOrder: 7,
    colors: {
      primary: '#00BCD4',
      secondary: '#E0F7FA'
    }
  },
  {
    name: 'Snacks & Confectionery',
    description: 'Snacks, sweets, and confectionery items',
    icon: 'candy',
    image: '/images/categories/snacks.jpg',
    displayOrder: 8,
    colors: {
      primary: '#E91E63',
      secondary: '#FCE4EC'
    }
  },
  {
    name: 'Spices & Condiments',
    description: 'Indian spices, masalas, and condiments',
    icon: 'spice',
    image: '/images/categories/spices.jpg',
    displayOrder: 9,
    colors: {
      primary: '#FF5722',
      secondary: '#FBE9E7'
    }
  },
  {
    name: 'Personal Care',
    description: 'Personal hygiene and care products',
    icon: 'soap',
    image: '/images/categories/personal-care.jpg',
    displayOrder: 10,
    colors: {
      primary: '#9C27B0',
      secondary: '#F3E5F5'
    }
  },
  {
    name: 'Household',
    description: 'Cleaning supplies and household items',
    icon: 'home',
    image: '/images/categories/household.jpg',
    displayOrder: 11,
    colors: {
      primary: '#607D8B',
      secondary: '#ECEFF1'
    }
  },
  {
    name: 'Baby Care',
    description: 'Baby food, diapers, and care products',
    icon: 'baby',
    image: '/images/categories/baby-care.jpg',
    displayOrder: 12,
    colors: {
      primary: '#FFC107',
      secondary: '#FFFDE7'
    }
  },

  // Subcategories for Groceries
  {
    name: 'Rice & Grains',
    description: 'Basmati rice, wheat, and other grains',
    parentCategory: 'Groceries',
    displayOrder: 1
  },
  {
    name: 'Pulses & Lentils',
    description: 'Dal, rajma, chana, and other pulses',
    parentCategory: 'Groceries',
    displayOrder: 2
  },
  {
    name: 'Cooking Oil',
    description: 'Sunflower, mustard, coconut, and other oils',
    parentCategory: 'Groceries',
    displayOrder: 3
  },
  {
    name: 'Flour & Atta',
    description: 'Wheat flour, maida, besan, and specialty flours',
    parentCategory: 'Groceries',
    displayOrder: 4
  },

  // Subcategories for Fresh Vegetables
  {
    name: 'Leafy Vegetables',
    description: 'Spinach, coriander, mint, and other leafy greens',
    parentCategory: 'Fresh Vegetables',
    displayOrder: 1
  },
  {
    name: 'Root Vegetables',
    description: 'Potato, onion, carrot, and other root vegetables',
    parentCategory: 'Fresh Vegetables',
    displayOrder: 2
  },
  {
    name: 'Exotic Vegetables',
    description: 'Broccoli, bell peppers, and imported vegetables',
    parentCategory: 'Fresh Vegetables',
    displayOrder: 3
  },

  // Subcategories for Fresh Fruits
  {
    name: 'Seasonal Fruits',
    description: 'Mango, orange, apple, and seasonal fruits',
    parentCategory: 'Fresh Fruits',
    displayOrder: 1
  },
  {
    name: 'Exotic Fruits',
    description: 'Imported and premium fruits',
    parentCategory: 'Fresh Fruits',
    displayOrder: 2
  },
  {
    name: 'Dry Fruits & Nuts',
    description: 'Almonds, cashews, dates, and dry fruits',
    parentCategory: 'Fresh Fruits',
    displayOrder: 3
  },

  // Subcategories for Dairy & Eggs
  {
    name: 'Milk & Yogurt',
    description: 'Fresh milk, curd, and yogurt products',
    parentCategory: 'Dairy & Eggs',
    displayOrder: 1
  },
  {
    name: 'Cheese & Butter',
    description: 'Paneer, cheese, butter, and spreads',
    parentCategory: 'Dairy & Eggs',
    displayOrder: 2
  },
  {
    name: 'Eggs',
    description: 'Fresh farm eggs and egg products',
    parentCategory: 'Dairy & Eggs',
    displayOrder: 3
  },

  // Subcategories for Beverages
  {
    name: 'Tea & Coffee',
    description: 'Tea leaves, coffee powder, and related products',
    parentCategory: 'Beverages',
    displayOrder: 1
  },
  {
    name: 'Soft Drinks',
    description: 'Coke, Pepsi, and carbonated drinks',
    parentCategory: 'Beverages',
    displayOrder: 2
  },
  {
    name: 'Juices',
    description: 'Fresh juices and packaged fruit drinks',
    parentCategory: 'Beverages',
    displayOrder: 3
  },
  {
    name: 'Water',
    description: 'Bottled water and mineral water',
    parentCategory: 'Beverages',
    displayOrder: 4
  }
];

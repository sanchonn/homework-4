/**
* Menu object
*
*/
// Price in US cents
const menu = {
  Margherita: {
    ingredients: 'Tomato sauce, mozzarella, and oregano',
    price: 50,
    foto: 'margherita.png',
  },
  Marinara: {
    ingredients: 'Tomato sauce, garlic and basil',
    price: 70,
    foto: 'marinara.png',
  },
  Quattro: {
    ingredients: 'Tomato sauce, mozzarella, mushrooms, ham, artichokes, olives, and oregano',
    price: 100,
    foto: 'stagioni.png',
  },
  Carbonara: {
    ingredients: 'Tomato sauce, mozzarella, parmesan, eggs, and bacon',
    price: 90,
    foto: 'carbonara.png',
  },
  Frutti: {
    ingredients: 'Tomato sauce and seafood',
    price: 200,
    foto: 'frutti.png',
  },
  Crudo: {
    ingredients: 'Tomato sauce, mozzarella and Parma ham',
    price: 250,
    foto: 'crudo.png',
  },
};

// Export the module
module.exports = menu;

export interface Product {
  id: string
  name: string
  price: string
  desc: string
  image: string
  stock?: number
  cost_price_cents?: number
}

export const PRODUCTS: Product[] = [
  // Capes
  { id: 'p1',  name: 'Barber Flow Camo Cape',                    price: 'TBD',   desc: 'Charcoal camo barber cape. Lightweight and water-resistant with snap closure.',               image: '/ZOPROD/15.png' },

  // Tools
  { id: 'p2',  name: 'ELV8 Fade Brush & Comb',                  price: '$2.50', desc: 'Dual-sided fade brush and comb combo. Black. Built for precision blending.',                 image: '/ZOPROD/17.png', stock: 9 },

  // Razor Holders
  { id: 'p3',  name: 'L3VEL3 Razor Holder — Blue',               price: '$10',   desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',       image: '/ZOPROD/6.png',  stock: 1 },
  { id: 'p4',  name: 'L3VEL3 Razor Holder — Green',              price: '$10',   desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',       image: '/ZOPROD/18.png', stock: 1 },
  { id: 'p5',  name: 'L3VEL3 Razor Holder — Black',              price: '$10',   desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',       image: '/ZOPROD/19.png', stock: 1 },

  // Blades
  { id: 'p6',  name: 'Derby Single Edge Blades (100 CT)',         price: '$10',   desc: 'Derby Professional single-edge blades. Chromium-ceramic-platinum coated. 100 per box.',      image: '/ZOPROD/11.png', stock: 3 },
  { id: 'p7',  name: 'Derby Premium Single Edge Blades (100 CT)', price: '$11',   desc: 'Derby Premium single-edge blades. Extra-sharp for clean, precise lines. 100 per box.',       image: '/ZOPROD/derby-premium.png', stock: 5 },
  { id: 'p8',  name: 'Spada Single Edge Blades (100 CT)',         price: '$6',    desc: 'Spada single-edge razor blades. The barber\'s choice for precision shaving. 100 pack.',      image: '/ZOPROD/21.png', stock: 10 },

  // Gloves
  { id: 'p9',  name: 'Black Nitrile Gloves — Large (100 pk)',     price: '$13',   desc: 'Gloveworks heavy-duty black nitrile gloves. Powder-free. Textured grip. 100 per box.',       image: '/ZOPROD/10.png', stock: 5 },
  { id: 'p10', name: 'L3VEL3 Nitrile Gloves Lime — Large',        price: '$24',   desc: 'L3VEL3 nitrile gloves in lime green. Powder-free, latex-free. 100 per box.',                 image: '/ZOPROD/8.png',  stock: 3 },

  // Neck Strips
  { id: 'p11', name: 'ELV8 Neck Strips (500 CT)',                 price: '$10',   desc: 'ELV8 Elevate Your Craft neck strips. Strong self-adhesive. 500 strips per roll.',             image: '/ZOPROD/16.png', stock: 6 },
  { id: 'p12', name: 'L3VEL3 Neck Strips — Blue',                 price: '$10',   desc: 'L3VEL3 blue neck strips. Soft and snug-fit. Keeps the client comfortable every cut.',         image: '/ZOPROD/14.png', stock: 2 },

  // Sprays
  { id: 'p13', name: 'Andis Cool Care Plus',                      price: '$16',   desc: 'Andis 5-in-1 clipper blade spray. Cools, cleans, lubricates, disinfects and prevents rust.', image: '/ZOPROD/12.png', stock: 3 },
  { id: 'p14', name: 'Clippercide Spray',                         price: '$15',   desc: 'Clippercide disinfectant spray. Kills 99.9% of bacteria on clipper blades.',                  image: '/ZOPROD/7.png',  stock: 4 },

  // Styling
  { id: 'p15', name: 'L3VEL3 Styling Powder 30g',                 price: '$13',   desc: 'L3VEL3 Styling Powder Dust. Texturizing matte finish with medium hold. 33% more free.',      image: '/ZOPROD/9.png',  stock: 8 },
  { id: 'p16', name: 'Redist Arginine Hair Styling Mousse 200ml', price: '$10',   desc: 'Redist Professional arginine mousse. Strong hold, protection for colored hair. 200ml.',        image: '/ZOPROD/20.png' },

  // New products
  { id: 'p17', name: 'RedOne Lemon Aftershave 5000ml',            price: '$55',   desc: 'RedOne Professional Lemon aftershave lotion. Refreshing scent, soothes skin post-shave. 5L.', image: '/ZOPROD/redone-lemon.png', stock: 1 },
  { id: 'p18', name: 'Argan Oil Defining Curl Cream 9.8oz',       price: '$20',   desc: 'One \'n Only Argan Oil Defining Curl Cream with Acacia Collagen. Combats aging hair. 280g.',  image: '/ZOPROD/13.png', stock: 3 },
  { id: 'p19', name: 'LV3 Texturizing Sea Salt Spray 250ml',      price: '$15',   desc: 'L3VEL3 sea salt texturizing spray. Adds volume, grit and natural wave. 250ml.',               image: '/ZOPROD/lv3-seasalt.png', stock: 5 },
]

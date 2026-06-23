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
  { id: 'p1',  name: 'Barber Flow Camo Cape',                    price: 'TBD', desc: 'Charcoal camo barber cape. Lightweight and water-resistant with snap closure.',          image: '/ZOPROD/15.png' },

  // Tools
  { id: 'p2',  name: 'ELV8 Fade Brush & Comb',                  price: 'TBD', desc: 'Dual-sided fade brush and comb combo. Black. Built for precision blending.',            image: '/ZOPROD/17.png' },
  { id: 'p3',  name: 'Akari Series 6" Shear',                    price: 'TBD', desc: 'Professional 6-inch barber shear. Precision-ground Japanese-style blade.',               image: '' },

  // Razor Holders
  { id: 'p4',  name: 'L3VEL3 Razor Holder — Blue',               price: 'TBD', desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',  image: '/ZOPROD/6.png'  },
  { id: 'p5',  name: 'L3VEL3 Razor Holder — Green',              price: 'TBD', desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',  image: '/ZOPROD/18.png' },
  { id: 'p6',  name: 'L3VEL3 Razor Holder — Black',              price: 'TBD', desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',  image: '/ZOPROD/19.png' },
  { id: 'p7',  name: 'L3VEL3 Razor Holder — Red',                price: 'TBD', desc: 'Straight razor holder by L3VEL3. Durable ABS body. Fits standard single-edge blades.',  image: '' },

  // Blades
  { id: 'p8',  name: 'Derby Single Edge Blades (100 CT)',         price: 'TBD', desc: 'Derby Professional single-edge blades. Chromium-ceramic-platinum coated. 100 per box.', image: '/ZOPROD/11.png' },
  { id: 'p9',  name: 'Derby Premium Single Edge Blades (100 CT)', price: 'TBD', desc: 'Derby Premium single-edge blades. Extra-sharp for clean, precise lines. 100 per box.',  image: '/ZOPROD/11.png' },
  { id: 'p10', name: 'Spada Single Edge Blades (100 CT)',         price: 'TBD', desc: 'Spada single-edge razor blades. The barber\'s choice for precision shaving. 100 pack.', image: '/ZOPROD/21.png' },

  // Gloves
  { id: 'p11', name: 'Black Nitrile Gloves — Large (100 pk)',     price: 'TBD', desc: 'Gloveworks heavy-duty black nitrile gloves. Powder-free. Textured grip. 100 per box.',  image: '/ZOPROD/10.png' },
  { id: 'p12', name: 'L3VEL3 Nitrile Gloves Lime — Large',        price: 'TBD', desc: 'L3VEL3 nitrile gloves in lime green. Powder-free, latex-free. 100 per box.',            image: '/ZOPROD/8.png'  },
  { id: 'p13', name: 'L3VEL3 Nitrile Gloves Red — Large',         price: 'TBD', desc: 'L3VEL3 nitrile gloves in red. Powder-free, latex-free. 100 per box.',                   image: '' },

  // Neck Strips
  { id: 'p14', name: 'ELV8 Neck Strips (500 CT)',                 price: 'TBD', desc: 'ELV8 Elevate Your Craft neck strips. Strong self-adhesive. 500 strips per roll.',        image: '/ZOPROD/16.png' },
  { id: 'p15', name: 'L3VEL3 Neck Strips — Blue',                 price: 'TBD', desc: 'L3VEL3 blue neck strips. Soft and snug-fit. Keeps the client comfortable every cut.',    image: '/ZOPROD/14.png' },

  // Sprays
  { id: 'p16', name: 'Andis Cool Care Plus',                      price: 'TBD', desc: 'Andis 5-in-1 clipper blade spray. Cools, cleans, lubricates, disinfects and prevents rust.', image: '/ZOPROD/12.png' },
  { id: 'p17', name: 'Clippercide Spray',                         price: 'TBD', desc: 'Clippercide disinfectant spray. Kills 99.9% of bacteria on clipper blades.',             image: '/ZOPROD/7.png'  },

  // Styling
  { id: 'p18', name: 'L3VEL3 Styling Powder 30g',                 price: 'TBD', desc: 'L3VEL3 Styling Powder Dust. Texturizing matte finish with medium hold. 33% more free.', image: '/ZOPROD/9.png'  },
  { id: 'p19', name: 'L3VEL3 Texturizing Sea Salt Spray 250ml',   price: 'TBD', desc: 'L3VEL3 sea salt spray. Adds volume, texture and natural definition. 250ml.',             image: '' },
  { id: 'p20', name: 'Redist Arginine Hair Styling Mousse 200ml', price: 'TBD', desc: 'Redist Professional arginine mousse. Strong hold, protection for colored hair. 200ml.',   image: '/ZOPROD/20.png' },
]

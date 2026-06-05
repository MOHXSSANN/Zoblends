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
  { id: 'p1', name: 'L3VEL3 Cream Gel',       price: '$22', desc: 'Medium hold, flake-free. Infused with Vitamin B5 for all-day control.',        image: '/L3G3L.png' },
  { id: 'p2', name: 'Aftershave Cologne',      price: '$28', desc: 'Refreshing and revitalizing. Moisturizing formula for all skin types. Royale.',  image: '/13.png'    },
  { id: 'p3', name: 'Straight Razor',          price: '$35', desc: 'Professional-grade straight razor. Clean cuts, smooth finish.',                  image: '/14.png'    },
  { id: 'p4', name: 'Beard Oil',               price: '$24', desc: 'Argan oil infused. Strengthens, softens and stops frizziness.',                  image: '/15.png'    },
  { id: 'p5', name: 'Nitrile Gloves',          price: '$16', desc: 'L3VEL3 Reddish nitrile gloves. Available in S/M/L/XL. 100 per box.',            image: '/16.png'    },
  { id: 'p6', name: 'Texturizing Salt Spray',  price: '$24', desc: 'Volumize and define. Natural look with light hold. Sea salt infused.',            image: '/17.png'    },
]

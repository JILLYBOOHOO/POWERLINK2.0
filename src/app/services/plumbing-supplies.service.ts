import { Injectable } from '@angular/core';

export interface ProductReview {
  author: string;
  rating: number;
  comment: string;
}

export interface PlumbingSupply {
  name: string;
  slug: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
  description: string;
  stock: string;
  stockCount: number;
  features: string[];
  reviews: ProductReview[];
}

@Injectable({
  providedIn: 'root'
})
export class PlumbingSuppliesService {
  readonly categories = [
    'All Supplies',
    'Pipes',
    'Fittings',
    'Fixtures',
    'Drain Care',
    'Repair Kits',
    'Tools',
    'Water Systems'
  ];

  readonly supplies: PlumbingSupply[] = [
    {
      name: 'PVC Pipe Bundle',
      slug: 'pvc-pipe-bundle',
      category: 'Pipes',
      price: 68,
      unit: 'bundle',
      image: 'assets/product-pvc-pipe-bundle.svg',
      badge: 'Contractor Pick',
      description: 'Pressure-rated PVC pipe sections for new installs and system replacements.',
      stock: '42 bundles in stock',
      stockCount: 42,
      features: ['Schedule 40 grade', 'Suitable for residential water lines', 'Easy solvent-weld fit'],
      reviews: [
        { author: 'Jason R.', rating: 5, comment: 'Good quality pipe bundle and easy to work with on site.' },
        { author: 'Melissa T.', rating: 4, comment: 'Delivered quickly and matched the spec we needed.' }
      ]
    },
    {
      name: 'Copper Tube Set',
      slug: 'copper-tube-set',
      category: 'Pipes',
      price: 115,
      unit: 'set',
      image: 'assets/product-copper-tube-set.svg',
      description: 'Reliable copper tubing for durable hot and cold water applications.',
      stock: '18 sets in stock',
      stockCount: 18,
      features: ['Corrosion resistant', 'For premium plumbing upgrades', 'Multiple diameters included'],
      reviews: [
        { author: 'Andre K.', rating: 5, comment: 'Solid tubing quality for premium installations.' },
        { author: 'Toni P.', rating: 4, comment: 'Exactly what our plumber requested.' }
      ]
    },
    {
      name: 'Compression Fitting Pack',
      slug: 'compression-fitting-pack',
      category: 'Fittings',
      price: 29,
      unit: 'pack',
      image: 'assets/product-compression-fitting-pack.svg',
      badge: 'Best Seller',
      description: 'Common elbow, tee, and coupling fittings for quick repair work.',
      stock: '95 packs in stock',
      stockCount: 95,
      features: ['Mixed connection sizes', 'Works for maintenance visits', 'Sealed storage case'],
      reviews: [
        { author: 'Ryan S.', rating: 5, comment: 'Great value and useful selection for service calls.' },
        { author: 'Paula N.', rating: 5, comment: 'Very handy pack to keep on standby.' }
      ]
    },
    {
      name: 'Shut-Off Valve Kit',
      slug: 'shut-off-valve-kit',
      category: 'Fittings',
      price: 36,
      unit: 'kit',
      image: 'assets/product-shut-off-valve-kit.svg',
      description: 'Quarter-turn shut-off valves for sink, toilet, and appliance lines.',
      stock: '64 kits in stock',
      stockCount: 64,
      features: ['Smooth brass finish', 'Fast isolation during repairs', 'Ideal for bathroom and kitchen lines'],
      reviews: [
        { author: 'Keith B.', rating: 5, comment: 'Valve quality feels strong and installed cleanly.' },
        { author: 'Lorna J.', rating: 4, comment: 'Good kit for quick replacements.' }
      ]
    },
    {
      name: 'Kitchen Faucet Pro',
      slug: 'kitchen-faucet-pro',
      category: 'Fixtures',
      price: 94,
      unit: 'fixture',
      image: 'assets/product-kitchen-faucet-pro.svg',
      badge: 'Featured',
      description: 'Modern kitchen faucet with pull-down spray and installation hardware.',
      stock: '27 fixtures in stock',
      stockCount: 27,
      features: ['Brushed nickel finish', 'Flexible braided hoses', 'Designed for easy retrofit installs'],
      reviews: [
        { author: 'Camille W.', rating: 5, comment: 'Looks premium and the spray head works smoothly.' },
        { author: 'Derrick M.', rating: 4, comment: 'Strong finish and easy install for our plumber.' }
      ]
    },
    {
      name: 'Toilet Rebuild Set',
      slug: 'toilet-rebuild-set',
      category: 'Fixtures',
      price: 48,
      unit: 'set',
      image: 'assets/product-toilet-rebuild-set.svg',
      description: 'Internal toilet repair parts for common flushing and fill issues.',
      stock: '58 sets in stock',
      stockCount: 58,
      features: ['Flush valve included', 'Universal fit components', 'Great for property maintenance'],
      reviews: [
        { author: 'Nadia C.', rating: 5, comment: 'Solved our flush issue without needing a full replacement.' },
        { author: 'Peter G.', rating: 4, comment: 'Useful set for recurring maintenance jobs.' }
      ]
    },
    {
      name: 'Drain Cleaning Set',
      slug: 'drain-cleaning-set',
      category: 'Drain Care',
      price: 42,
      unit: 'set',
      image: 'assets/product-drain-cleaning-set.svg',
      description: 'Drain auger, enzyme treatment, and cleanup accessories for blocked lines.',
      stock: '31 sets in stock',
      stockCount: 31,
      features: ['For sink and shower drains', 'Routine maintenance friendly', 'Packed for service calls'],
      reviews: [
        { author: 'Sonia H.', rating: 5, comment: 'Everything needed for a stubborn drain issue.' },
        { author: 'Devon A.', rating: 4, comment: 'Good all-in-one drain maintenance set.' }
      ]
    },
    {
      name: 'Heavy-Duty Plunger',
      slug: 'heavy-duty-plunger',
      category: 'Drain Care',
      price: 18,
      unit: 'tool',
      image: 'assets/product-heavy-duty-plunger.svg',
      description: 'Commercial-grade plunger for toilets, floor drains, and stubborn clogs.',
      stock: '76 units in stock',
      stockCount: 76,
      features: ['Reinforced handle', 'High-pressure seal', 'Suitable for emergency kits'],
      reviews: [
        { author: 'Kimberly E.', rating: 5, comment: 'Much stronger than a standard household plunger.' },
        { author: 'Jordan F.', rating: 4, comment: 'Good pressure and easy grip.' }
      ]
    },
    {
      name: 'Leak Repair Bundle',
      slug: 'leak-repair-bundle',
      category: 'Repair Kits',
      price: 34,
      unit: 'set',
      image: 'assets/product-leak-repair-bundle.svg',
      description: 'Pipe seal tape, compound, washers, and emergency repair fittings.',
      stock: '88 sets in stock',
      stockCount: 88,
      features: ['For urgent leak response', 'Works across common fixture repairs', 'Compact field kit'],
      reviews: [
        { author: 'Asha M.', rating: 5, comment: 'Useful kit to keep around for fast leak fixes.' },
        { author: 'Leon P.', rating: 5, comment: 'Compact and covers the basics well.' }
      ]
    },
    {
      name: 'Water Heater Connection Kit',
      slug: 'water-heater-connection-kit',
      category: 'Water Systems',
      price: 59,
      unit: 'kit',
      image: 'assets/product-water-heater-connection-kit.svg',
      description: 'Flexible connectors, valves, and mounting accessories for heater installs.',
      stock: '24 kits in stock',
      stockCount: 24,
      features: ['Compatible with common tank systems', 'Speeds up installation', 'Includes safety fittings'],
      reviews: [
        { author: 'Monique D.', rating: 4, comment: 'Good kit for water heater replacements.' },
        { author: 'Stefan L.', rating: 5, comment: 'Saved time on installation day.' }
      ]
    },
    {
      name: 'Pipe Wrench Pair',
      slug: 'pipe-wrench-pair',
      category: 'Tools',
      price: 51,
      unit: 'pair',
      image: 'assets/product-pipe-wrench-pair.svg',
      description: 'Two heavy-duty pipe wrenches sized for residential and commercial jobs.',
      stock: '33 pairs in stock',
      stockCount: 33,
      features: ['Drop-forged jaws', 'Comfort grip handles', 'Ready for rough service work'],
      reviews: [
        { author: 'Travis O.', rating: 5, comment: 'Strong grip and feels durable for daily use.' },
        { author: 'Renee V.', rating: 4, comment: 'Reliable wrench pair for service work.' }
      ]
    },
    {
      name: 'PEX Crimp Tool Set',
      slug: 'pex-crimp-tool-set',
      category: 'Tools',
      price: 83,
      unit: 'set',
      image: 'assets/product-pex-crimp-tool-set.svg',
      description: 'Crimping tool and calibration accessories for PEX line installations.',
      stock: '19 sets in stock',
      stockCount: 19,
      features: ['For rapid line installs', 'Contractor-grade tool steel', 'Includes carrying case'],
      reviews: [
        { author: 'Omar C.', rating: 5, comment: 'Accurate crimps and solid build quality.' },
        { author: 'Lisa R.', rating: 4, comment: 'Good kit for PEX jobs and easy to store.' }
      ]
    }
  ];

  getBySlug(slug: string | null): PlumbingSupply | undefined {
    return this.supplies.find((item) => item.slug === slug);
  }

  getRelatedProducts(product: PlumbingSupply, limit = 3): PlumbingSupply[] {
    return this.supplies
      .filter((item) => item.slug !== product.slug && item.category === product.category)
      .slice(0, limit);
  }

  getStockStatus(stockCount: number): string {
    if (stockCount <= 20) {
      return 'Low Stock';
    }

    if (stockCount <= 40) {
      return 'Limited Stock';
    }

    return 'In Stock';
  }
}

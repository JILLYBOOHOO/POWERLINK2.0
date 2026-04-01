import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PlumbingSupply, PlumbingSuppliesService } from '../../services/plumbing-supplies.service';

@Component({
  selector: 'app-insurance',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.css']
})
export class InsuranceComponent {
  readonly categories = this.suppliesService.categories;
  readonly supplies = this.suppliesService.supplies;

  selectedCategory = 'All Supplies';
  searchTerm = '';
  feedbackMessage = '';
  quantities: Record<string, number> = {};

  constructor(
    private router: Router,
    public cartService: CartService,
    private suppliesService: PlumbingSuppliesService
  ) {}

  get filteredSupplies(): PlumbingSupply[] {
    return this.supplies.filter((item) => {
      const matchesCategory =
        this.selectedCategory === 'All Supplies' || item.category === this.selectedCategory;
      const term = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }

  get featuredSupplies(): PlumbingSupply[] {
    return this.supplies.filter((item) => !!item.badge).slice(0, 3);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  addToCart(item: PlumbingSupply): void {
    const quantity = this.getQuantity(item.slug);
    this.cartService.addItem({
      name: item.name,
      price: item.price,
      unit: item.unit,
      category: item.category
    }, quantity);
    this.feedbackMessage = `${quantity} ${item.name} added to cart.`;
  }

  getQuantity(slug: string): number {
    return this.quantities[slug] || 1;
  }

  updateQuantity(slug: string, amount: number): void {
    const nextQuantity = this.getQuantity(slug) + amount;
    this.quantities[slug] = nextQuantity > 1 ? nextQuantity : 1;
  }

  viewProduct(item: PlumbingSupply): void {
    this.router.navigate(['/supplies', item.slug]);
  }

  buySupply(item: PlumbingSupply): void {
    this.router.navigate(['/payment'], {
      queryParams: {
        plan: item.name,
        checkoutType: 'supply',
        price: item.price,
        fee: 8,
        feeLabel: 'Delivery'
      }
    });
  }
}

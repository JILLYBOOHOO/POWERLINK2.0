import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PlumbingSupply, PlumbingSuppliesService } from '../../services/plumbing-supplies.service';

@Component({
  selector: 'app-supply-detail',
  templateUrl: './supply-detail.component.html',
  styleUrls: ['./supply-detail.component.css']
})
export class SupplyDetailComponent {
  readonly product?: PlumbingSupply;
  readonly relatedProducts: PlumbingSupply[];
  feedbackMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suppliesService: PlumbingSuppliesService,
    private cartService: CartService
  ) {
    this.product = this.suppliesService.getBySlug(this.route.snapshot.paramMap.get('slug'));
    this.relatedProducts = this.product ? this.suppliesService.getRelatedProducts(this.product) : [];
  }

  get stockStatus(): string {
    return this.product ? this.suppliesService.getStockStatus(this.product.stockCount) : '';
  }

  get productHighlights(): string[] {
    if (!this.product) {
      return [];
    }

    return [
      `${this.product.category} grade`,
      `${this.product.stockCount} units ready`,
      `Sold per ${this.product.unit}`
    ];
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.cartService.addItem({
      name: this.product.name,
      price: this.product.price,
      unit: this.product.unit,
      category: this.product.category
    });
    this.feedbackMessage = `${this.product.name} added to cart.`;
  }

  buyNow(): void {
    if (!this.product) {
      return;
    }

    this.router.navigate(['/payment'], {
      queryParams: {
        plan: this.product.name,
        checkoutType: 'supply',
        price: this.product.price,
        fee: 8,
        feeLabel: 'Delivery'
      }
    });
  }

  viewProduct(slug: string): void {
    this.router.navigate(['/supplies', slug]);
  }
}

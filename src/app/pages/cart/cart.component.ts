import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  readonly deliveryFee = 12;
  readonly pickupFee = 0;
  fulfillmentMode: 'delivery' | 'pickup' = 'delivery';

  constructor(public cartService: CartService, private router: Router) {}

  get totalPrice(): number {
    return this.cartService.subtotal + this.fulfillmentFee;
  }

  get fulfillmentFee(): number {
    return this.fulfillmentMode === 'delivery' ? this.deliveryFee : this.pickupFee;
  }

  proceedToCheckout(): void {
    this.router.navigate(['/payment'], {
      queryParams: {
        mode: 'cart',
        fee: this.fulfillmentFee,
        feeLabel: this.fulfillmentMode === 'delivery' ? 'Delivery' : 'Pickup',
        fulfillment: this.fulfillmentMode
      }
    });
  }
}

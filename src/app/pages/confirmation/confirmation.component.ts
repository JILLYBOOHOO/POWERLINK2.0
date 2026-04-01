import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
  orderName = 'Plumbing order';
  customerName = 'Customer';
  total = 0;
  fulfillment = 'Delivery';
  orderReference = '';
  customerEmail = '';
  address = '';
  city = '';
  country = '';
  providerName = '';
  serviceSpecialty = '';
  serviceDate = '';
  serviceTime = '';
  serviceNotes = '';
  isValidConfirmation = false;

  get hasAddress(): boolean {
    return !!(this.address && this.city && this.country);
  }

  get isServiceBooking(): boolean {
    return this.fulfillment === 'Scheduled service';
  }

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParamMap.subscribe((params) => {
      const orderName = params.get('order');
      const customerName = params.get('name');
      const total = Number(params.get('total'));
      const fulfillment = params.get('fulfillment');
      const reference = params.get('reference');
      const email = params.get('email');
      const address = params.get('address');
      const city = params.get('city');
      const country = params.get('country');
      const provider = params.get('provider');
      const specialty = params.get('specialty');
      const serviceDate = params.get('serviceDate');
      const serviceTime = params.get('serviceTime');
      const notes = params.get('notes');

      if (!orderName || !customerName || Number.isNaN(total) || total < 0 || !fulfillment || !reference) {
        this.router.navigate(['/supplies']);
        return;
      }

      this.orderName = orderName;
      this.customerName = customerName;
      this.total = total;
      this.fulfillment = fulfillment;
      this.orderReference = reference;
      this.customerEmail = email || '';
      this.address = address || '';
      this.city = city || '';
      this.country = country || '';
      this.providerName = provider || '';
      this.serviceSpecialty = specialty || '';
      this.serviceDate = serviceDate || '';
      this.serviceTime = serviceTime || '';
      this.serviceNotes = notes || '';
      this.isValidConfirmation = true;
    });
  }

  printReceipt(): void {
    window.print();
  }
}

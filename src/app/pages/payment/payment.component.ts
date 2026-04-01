
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

interface BookingDateOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-payments',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  paymentForm: FormGroup;
  errorMessage = '';
  selectedPlan = 'Plumbing service booking';
  planPrice = 95;
  serviceFee = 20;
  feeLabel = 'Booking fee';
  checkoutMode: 'single' | 'cart' = 'single';
  singleCheckoutType: 'plumber' | 'supply' = 'plumber';
  fulfillmentMode: 'delivery' | 'pickup' = 'delivery';
  providerName = '';
  serviceArea = '';
  serviceSpecialty = '';
  availableDates: BookingDateOption[] = [];
  availableTimes: string[] = ['8:00 AM', '10:00 AM', '12:30 PM', '3:00 PM', '5:30 PM'];
  private readonly pickupAddress = {
    address: 'Kingston Supply Counter',
    city: 'Kingston',
    country: 'Jamaica'
  };

  get totalPrice(): number {
    return this.planPrice + this.serviceFee;
  }

  get isPlumberBooking(): boolean {
    return this.checkoutMode === 'single' && this.singleCheckoutType === 'plumber';
  }

  get isSupplyCheckout(): boolean {
    return this.checkoutMode === 'single' && this.singleCheckoutType === 'supply';
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public cartService: CartService,
    private adminDashboardService: AdminDashboardService
  ) {
    this.availableDates = this.buildAvailableDates();
    this.paymentForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', Validators.required],
      expiry: ['', Validators.required],
      cvv: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      serviceDate: [''],
      serviceTime: [''],
      serviceNotes: ['']
    });

    this.route.queryParamMap.subscribe(params => {
      const plan = params.get('plan');
      const price = Number(params.get('price'));
      const fee = Number(params.get('fee'));
      const feeLabel = params.get('feeLabel');
      const mode = params.get('mode');
      const checkoutType = params.get('checkoutType');
      const fulfillment = params.get('fulfillment');
      const provider = params.get('provider');
      const serviceArea = params.get('serviceArea');
      const specialty = params.get('specialty');

      if (plan) {
        this.selectedPlan = plan;
      }

      if (!Number.isNaN(price) && price > 0) {
        this.planPrice = price;
      }

      if (!Number.isNaN(fee) && fee >= 0) {
        this.serviceFee = fee;
      }

      if (feeLabel) {
        this.feeLabel = feeLabel;
      }

      if (mode) {
        this.checkoutMode = mode === 'cart' ? 'cart' : 'single';
      }

      if (checkoutType === 'supply' || checkoutType === 'plumber') {
        this.singleCheckoutType = checkoutType;
      }

      if (fulfillment === 'pickup' || fulfillment === 'delivery') {
        this.fulfillmentMode = fulfillment;
      }

      this.providerName = provider || '';
      this.serviceArea = serviceArea || '';
      this.serviceSpecialty = specialty || '';

      if (this.checkoutMode === 'cart' && this.cartService.cartItems.length > 0) {
        this.selectedPlan = 'Plumbing supply order';
        this.planPrice = this.cartService.subtotal;
      } else if (this.isSupplyCheckout) {
        this.serviceFee = !Number.isNaN(fee) && fee >= 0 ? fee : 8;
        this.feeLabel = feeLabel || 'Delivery';
      } else if (this.isPlumberBooking) {
        this.applyDefaultBookingSlot();
      }

      this.updateFormValidators();
    });
  }

  setFulfillment(mode: 'delivery' | 'pickup'): void {
    this.fulfillmentMode = mode;
    this.serviceFee = mode === 'delivery' ? 12 : 0;
    this.feeLabel = mode === 'delivery' ? 'Delivery' : 'Pickup';
    this.updateFormValidators();

    if (mode === 'pickup') {
      this.paymentForm.patchValue(this.pickupAddress);
    }
  }

  async submitPayment() {
    this.errorMessage = '';

    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.getRawValue();
      const customerName = formValue.fullName || 'Customer';
      const orderName = this.selectedPlan;
      const total = this.totalPrice;
      const reference = this.generateOrderReference();
      const fulfillment = this.checkoutMode === 'cart'
        ? (this.fulfillmentMode === 'delivery' ? 'Delivery' : 'Pickup')
        : (this.isSupplyCheckout ? 'Delivery' : 'Scheduled service');
      const orderType = this.isPlumberBooking ? 'Plumber Booking' : 'Supply Order';
      const queryParams = {
        name: customerName,
        order: orderName,
        total,
        fulfillment,
        reference,
        email: formValue.email || '',
        address: formValue.address || '',
        city: formValue.city || '',
        country: formValue.country || '',
        provider: this.providerName,
        specialty: this.serviceSpecialty,
        serviceDate: formValue.serviceDate || '',
        serviceTime: formValue.serviceTime || '',
        notes: formValue.serviceNotes || ''
      };

      const saved = await this.adminDashboardService.addOrder({
        reference,
        customer: customerName,
        item: orderName,
        type: orderType,
        total,
        fulfillment
      });

      if (!saved) {
        this.errorMessage = 'Order could not be saved. Make sure the API server is running and try again.';
        return;
      }

      this.router.navigate(['/confirmation'], {
        queryParams
      }).then((navigated) => {
        if (navigated) {
          if (this.checkoutMode === 'cart') {
            this.cartService.clear();
          }
          this.paymentForm.reset();
          this.fulfillmentMode = 'delivery';
          this.paymentForm.patchValue({
            address: '',
            city: '',
            country: '',
            serviceDate: '',
            serviceTime: '',
            serviceNotes: ''
          });
          this.applyDefaultBookingSlot();
          this.updateFormValidators();
        }
      });
    }
  }

  selectServiceDate(date: string): void {
    this.paymentForm.patchValue({ serviceDate: date });
  }

  selectServiceTime(time: string): void {
    this.paymentForm.patchValue({ serviceTime: time });
  }

  private generateOrderReference(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    return `PL-${timestamp}-${random}`;
  }

  private buildAvailableDates(): BookingDateOption[] {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index + 1);
      const value = date.toISOString().split('T')[0];
      const label = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(date);
      return { value, label };
    });
  }

  private applyDefaultBookingSlot(): void {
    if (!this.isPlumberBooking) {
      return;
    }

    const currentDate = this.paymentForm.get('serviceDate')?.value;
    const currentTime = this.paymentForm.get('serviceTime')?.value;

    this.paymentForm.patchValue({
      serviceDate: currentDate || this.availableDates[0]?.value || '',
      serviceTime: currentTime || this.availableTimes[0] || ''
    }, { emitEvent: false });
  }

  private updateFormValidators(): void {
    const address = this.paymentForm.get('address');
    const city = this.paymentForm.get('city');
    const country = this.paymentForm.get('country');
    const serviceDate = this.paymentForm.get('serviceDate');
    const serviceTime = this.paymentForm.get('serviceTime');
    const serviceNotes = this.paymentForm.get('serviceNotes');

    if (!address || !city || !country || !serviceDate || !serviceTime || !serviceNotes) {
      return;
    }

    if (this.checkoutMode === 'cart' && this.fulfillmentMode === 'pickup') {
      address.clearValidators();
      city.clearValidators();
      country.clearValidators();
    } else {
      address.setValidators([Validators.required]);
      city.setValidators([Validators.required]);
      country.setValidators([Validators.required]);
    }

    if (this.isPlumberBooking) {
      serviceDate.setValidators([Validators.required]);
      serviceTime.setValidators([Validators.required]);
      this.applyDefaultBookingSlot();
    } else {
      serviceDate.clearValidators();
      serviceTime.clearValidators();
      this.paymentForm.patchValue({
        serviceDate: '',
        serviceTime: '',
        serviceNotes: this.isSupplyCheckout ? 'Standard delivery requested.' : ''
      }, { emitEvent: false });
    }

    serviceNotes.setValidators(this.isPlumberBooking ? [Validators.maxLength(240)] : [Validators.maxLength(240)]);

    address.updateValueAndValidity({ emitEvent: false });
    city.updateValueAndValidity({ emitEvent: false });
    country.updateValueAndValidity({ emitEvent: false });
    serviceDate.updateValueAndValidity({ emitEvent: false });
    serviceTime.updateValueAndValidity({ emitEvent: false });
    serviceNotes.updateValueAndValidity({ emitEvent: false });
  }
}

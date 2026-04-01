import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlumberProfile, PlumbersService } from '../../services/plumbers.service';

@Component({
  selector: 'app-plumber-detail',
  templateUrl: './plumber-detail.component.html',
  styleUrls: ['./plumber-detail.component.css']
})
export class PlumberDetailComponent {
  readonly plumber?: PlumberProfile;
  readonly relatedPlumbers: PlumberProfile[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plumbersService: PlumbersService
  ) {
    this.plumber = this.plumbersService.getBySlug(this.route.snapshot.paramMap.get('slug'));
    this.relatedPlumbers = this.plumber ? this.plumbersService.getRelated(this.plumber) : [];
  }

  get profileHighlights(): string[] {
    if (!this.plumber) {
      return [];
    }

    return [
      `${this.plumber.experience} years experience`,
      `${this.plumber.rating} / 5 rating`,
      this.plumber.availability
    ];
  }

  bookNow(): void {
    if (!this.plumber) {
      return;
    }

    this.router.navigate(['/payment'], {
      queryParams: {
        plan: `${this.plumber.name} plumbing service`,
        checkoutType: 'plumber',
        price: this.plumber.serviceFee,
        fee: 20,
        feeLabel: 'Booking fee',
        provider: this.plumber.name,
        serviceArea: this.plumber.location,
        specialty: this.plumber.specialty
      }
    });
  }

  viewProfile(slug: string): void {
    this.router.navigate(['/plumbers', slug]);
  }
}

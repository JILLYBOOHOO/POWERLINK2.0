import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlumberProfile, PlumbersService } from '../../services/plumbers.service';

@Component({
  selector: 'app-mechanic',
  templateUrl: './mechanic.component.html',
  styleUrls: ['./mechanic.component.css']
})
export class MechanicComponent implements OnInit {
  mechanic: PlumberProfile[] = [];
  selectedMechanicMessage = '';

  searchText: string = '';
  selectedLocation: string = '';

  constructor(
    private router: Router,
    private plumbersService: PlumbersService
  ) {}

  ngOnInit(): void {
    this.mechanic = [...this.plumbersService.plumbers];
  }

  filteredMechanic() {
    return this.mechanic.filter(m =>
      (m.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
       m.specialty.toLowerCase().includes(this.searchText.toLowerCase())) &&
      (this.selectedLocation === '' || m.location === this.selectedLocation)
    );
  }

  chooseMechanic(mechanic: PlumberProfile) {
    this.selectedMechanicMessage = `You selected ${mechanic.name} for ${mechanic.specialty}.`;
    this.router.navigate(['/payment'], {
      queryParams: {
        plan: `${mechanic.name} plumbing service`,
        checkoutType: 'plumber',
        price: mechanic.serviceFee,
        fee: 20,
        feeLabel: 'Booking fee',
        provider: mechanic.name,
        serviceArea: mechanic.location,
        specialty: mechanic.specialty
      }
    });
  }
}

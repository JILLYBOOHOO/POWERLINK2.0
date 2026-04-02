import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  constructor(public adminService: AdminDashboardService) {}

  ngOnInit(): void {
    this.adminService.loadOrders();
  }

  get totalRevenue(): number {
    return this.adminService.orders.reduce((sum, order) => sum + Number(order.total), 0);
  }

  get activeBookings(): number {
    return this.adminService.orders.filter((order) => order.type === 'Plumber Booking').length;
  }
}

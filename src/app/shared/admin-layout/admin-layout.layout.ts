import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router'; 
import { MenuComponent } from '../menu/menu.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, MenuComponent], 
  templateUrl: './admin-layout.layout.html',
  styleUrls: ['./admin-layout.layout.css']
})
export class AdminLayoutLayout implements OnInit {
  userName: string = '';
  userRol: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRol = this.authService.getRol() || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']); 
  }
}
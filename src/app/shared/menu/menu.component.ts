// shared/menu/menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 🔹 Inyectamos Router aquí
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styles: [] 
})
export class MenuComponent implements OnInit {
  menuItems: any[] = [];
  userName: string = '';
  userRol: string = '';
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRol = this.authService.getRol() || '';
    this.menuItems = this.authService.getMenuItems();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
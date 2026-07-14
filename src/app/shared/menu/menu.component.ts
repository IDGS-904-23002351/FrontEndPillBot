// shared/menu/menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],  // ← Importa esto
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuItems: any[] = [];
  userName: string = '';
  userRol: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRol = this.authService.getRol() || '';
    this.menuItems = this.authService.getMenuItems();
  }

  logout() {
    this.authService.logout();
    // Navegar al login (debes inyectar Router)
  }
}
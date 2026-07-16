import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenuComponent
  ],
  templateUrl: './cliente-layout.html',
  styleUrl: './cliente-layout.css'
})
export class ClienteLayout implements OnInit {

  private authService = inject(AuthService);
  userName = 'Usuario Cliente'; 
  userRol = '';

  ngOnInit(): void {
    const nombre = this.authService.getUserName();
    const rol = this.authService.getRol();

    if (nombre && nombre.trim()) {
      this.userName = nombre; 
    }

    if (rol && rol.trim()) {
      this.userRol = rol.toUpperCase();
    }
  }
}
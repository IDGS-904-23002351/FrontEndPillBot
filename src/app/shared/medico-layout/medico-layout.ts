import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-medico-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    MenuComponent 
  ],
  templateUrl: './medico-layout.html',
  styleUrl: './medico-layout.css'
})
export class MedicoLayout implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombreUsuario = 'Usuario Médico';

  ngOnInit(): void {
    const nombre = this.authService.getUserName();
    if (nombre && nombre.trim()) {
      this.nombreUsuario = nombre;
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
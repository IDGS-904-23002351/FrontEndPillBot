import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-medico-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './medico-layout.html',
  styleUrl: './medico-layout.css'
})
export class MedicoLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombreUsuario = this.authService.getUserName() || 'Usuario Médico';

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
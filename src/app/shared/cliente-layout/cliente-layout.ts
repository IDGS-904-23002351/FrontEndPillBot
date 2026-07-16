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

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './cliente-layout.html',
  styleUrl: './cliente-layout.css'
})
export class ClienteLayout implements OnInit {

  private authService = inject(AuthService);

  nombreUsuario = 'Usuario Cliente';

  ngOnInit(): void {
    const nombre = this.authService.getUserName();

    if (nombre.trim()) {
      this.nombreUsuario = nombre;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

interface UsuarioSesion {
  idUsuario?: number;
  nombre?: string;
  nombreCompleto?: string;
  rol?: string;
  idRol?: number;
}

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

  nombreUsuario = 'Usuario Cliente';

  ngOnInit(): void {
    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return;
    }

    try {
      const usuario: UsuarioSesion = JSON.parse(usuarioGuardado);

      this.nombreUsuario =
        usuario.nombreCompleto ||
        usuario.nombre ||
        'Usuario Cliente';

    } catch (error) {
      console.error(
        'No se pudo leer la información del usuario.',
        error
      );
    }
  }
}

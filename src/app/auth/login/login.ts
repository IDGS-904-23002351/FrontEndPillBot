import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None // Hace que el CSS sea global para este componente
})
export class Login {
}
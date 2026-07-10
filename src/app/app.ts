import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecetaComponent } from './receta/receta';


@Component({
  selector: 'app-root',
  imports: [RecetaComponent],   // agrega esto
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private http = inject(HttpClient);

  mensaje = signal('Cargando...');

  ngOnInit() {
    this.http.get<any>('https://localhost:7046/api/api')
      .subscribe({
        next: (data) => {
          this.mensaje.set(data.mensaje);
        },
        error: (err) => {
          console.error(err);
          this.mensaje.set('Error al conectar con el backend');
        }
      });
  }
}
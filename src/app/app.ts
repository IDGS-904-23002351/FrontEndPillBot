import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
<<<<<<< Updated upstream
export class App {}
=======
export class App {

  private http = inject(HttpClient);

  mensaje = signal('Cargando...');

  ngOnInit() {
    this.http.get<any>('https://fl6rbp6p-7046.usw3.devtunnels.ms/api/api')
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
>>>>>>> Stashed changes

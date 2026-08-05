
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router  } from '@angular/router';
import { ProductoService } from '../productos/producto.service';
import { Producto } from '../../app/models/productos.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);
  private router = inject(Router);
  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(false);
  errorCarga = signal<string>('');

  totalProductos = computed(() => this.productos().length);
  productosActivos = computed(() => this.productos().filter(p => p.activo).length);

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.productoService.consultarProductos().subscribe({
      next: (res) => {
        console.log('Respuesta completa:', res);
        
        let productosData: Producto[] = [];
        
        if (res) {
          if (res.success && Array.isArray(res.data)) {
            productosData = res.data;
          } else if (Array.isArray(res)) {
            productosData = res;
          } else if (res.data) {
            if (Array.isArray(res.data)) {
              productosData = res.data;
            } else if (typeof res.data === 'object') {
              const dataObj = res.data as any;
              if (Array.isArray(dataObj.productos)) {
                productosData = dataObj.productos;
              } else if (Array.isArray(dataObj.items)) {
                productosData = dataObj.items;
              }
            }
          }
        }
        
        console.log('Productos procesados:', productosData);
        this.productos.set(productosData);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorCarga.set(err.error?.message || 'No se pudieron cargar los modelos IoT.');
        this.cargando.set(false);
      }
    });
  }

  obtenerImagenUrl(foto: string | null): string {
    if (!foto || foto.trim() === '') {
      return '';
    }
    
    if (foto.startsWith('data:image')) {
      return foto;
    }
    
    return `data:image/jpeg;base64,${foto}`;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  truncarTexto(texto: string | null, maxLength: number = 80): string {
    if (!texto) return 'Dispositivo inteligente IoT';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  }

  verDetalle(producto: Producto): void {
    
      this.router.navigate(['/login']);
  }
  
  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
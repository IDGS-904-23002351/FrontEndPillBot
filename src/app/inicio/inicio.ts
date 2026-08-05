// src/app/pages/inicio/inicio.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../productos/producto.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);

  productos = signal<Producto[]>([]);
  cargando = signal(false);
  errorCarga = signal('');

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
        if (res && res.success && Array.isArray(res.data)) {
          this.productos.set(res.data);
        } else {
          this.productos.set([]);
          console.warn('Formato de respuesta desconocido:', res);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorCarga.set(err.error?.message || 'No se pudieron cargar los modelos IoT.');
        this.cargando.set(false);
      }
    });
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
    console.log('Ver detalle del modelo IoT:', producto.nombre);
  }
  scrollTo(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
}
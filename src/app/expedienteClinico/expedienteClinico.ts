import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface ClienteExpediente {
  usuarioId: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoSangre?: string | null;
  alergias?: string | null;
  contactoEmergencia?: string | null;
  telefonoEmergencia?: string | null;
}

type ModoModal = 'ninguno' | 'ver' | 'editar';

@Component({
  selector: 'app-expediente-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expedienteClinico.html',
  styleUrl: './expedienteClinico.css'
})
export class ExpedienteClinicoComponent implements OnInit {
  private http = inject(HttpClient);

  private readonly apiExpediente = 'https://localhost:7046/api/clientes/expediente';
  private readonly apiActualizar = 'https://localhost:7046/api/clientes/actualizar';

  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  clientes = signal<ClienteExpediente[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  clienteSeleccionado = signal<ClienteExpediente | null>(null);
  clienteForm: Partial<ClienteExpediente> = {};
  guardando = signal(false);
  errorFormulario = signal('');

  clientesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.clientes();
    if (!termino) return lista;
    return lista.filter(c =>
      (c.nombreCompleto ?? '').toLowerCase().includes(termino) ||
      (c.correo ?? '').toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.http.get<ClienteExpediente[]>(this.apiExpediente).subscribe({
      next: (data) => {
        this.clientes.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el listado de clientes. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  // ---------- Modales ----------

  abrirVer(cliente: ClienteExpediente): void {
    this.clienteSeleccionado.set(cliente);
    this.modal.set('ver');
  }

  abrirEditar(cliente: ClienteExpediente): void {
    this.clienteForm = { ...cliente };
    this.errorFormulario.set('');
    this.modal.set('editar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.clienteSeleccionado.set(null);
    this.errorFormulario.set('');
  }

  // ---------- Guardar (solo edición de datos clínicos/emergencia) ----------

  guardarExpediente(): void {
    const f = this.clienteForm;

    if (!f.tipoSangre) {
      this.errorFormulario.set('Selecciona el tipo de sangre.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    // Se reenvían telefono/direccion tal cual venían, para no perderlos:
    // el SP los actualiza junto con lo clínico, pero el médico no los edita aquí.
    const payload = {
      usuarioId: f.usuarioId,
      telefono: f.telefono ?? '',
      direccion: f.direccion ?? '',
      tipoSangre: f.tipoSangre,
      alergias: f.alergias?.trim() ? f.alergias : null,
      contactoEmergencia: f.contactoEmergencia?.trim() ? f.contactoEmergencia : null,
      telefonoEmergencia: f.telefonoEmergencia?.trim() ? f.telefonoEmergencia : null
    };

    this.http.put(this.apiActualizar, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarClientes();
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No se pudo actualizar el expediente del cliente.');
      }
    });
  }
}
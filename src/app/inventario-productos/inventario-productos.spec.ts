import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  InventarioProductos
} from './inventario-productos';

describe('InventarioProductos', () => {

  let component: InventarioProductos;
  let fixture:
    ComponentFixture<InventarioProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InventarioProductos
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        InventarioProductos
      );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
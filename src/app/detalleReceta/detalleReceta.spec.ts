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

import { DetalleRecetaComponent } from './detalleReceta';

describe('DetalleRecetaComponent', () => {
  let component: DetalleRecetaComponent;
  let fixture: ComponentFixture<DetalleRecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRecetaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleRecetaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
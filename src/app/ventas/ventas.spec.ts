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

import { Ventas } from './ventas';

describe('Ventas', () => {

  let component: Ventas;
  let fixture: ComponentFixture<Ventas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ventas],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Ventas);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
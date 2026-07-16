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
  DashboardVentas
} from './dashboard-ventas';

describe('DashboardVentas', () => {

  let component: DashboardVentas;
  let fixture:
    ComponentFixture<DashboardVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardVentas
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        DashboardVentas
      );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
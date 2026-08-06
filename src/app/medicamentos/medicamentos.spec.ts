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

import { MedicamentosComponent } from './medicamentos';

describe('MedicamentosComponent', () => {
  let component: MedicamentosComponent;
  let fixture: ComponentFixture<MedicamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
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

import { RecetaComponent } from './receta';

describe('RecetaComponent', () => {
  let component: RecetaComponent;
  let fixture: ComponentFixture<RecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
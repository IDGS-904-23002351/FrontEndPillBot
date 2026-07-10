import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutLayout } from './admin-layout.layout';

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutLayout;
  let fixture: ComponentFixture<AdminLayoutLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutLayout],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutLayout);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
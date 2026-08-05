import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from '../login/login';
import { HttpClientTestingModule } from '@angular/common/http/testing';   
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule], 
      providers: [AuthService] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have empty credentials initially', () => {
    expect(component.usuario.correo).toBe('');
    expect(component.usuario.contrasena).toBe('');
  });
});
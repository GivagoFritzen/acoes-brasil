import { TestBed } from '@angular/core/testing';
import { FileInputComponent } from './file-input.component';

describe('FileInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileInputComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(FileInputComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

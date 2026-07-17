import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ClickOutsideDirective } from './ClickOutsideDirective';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div id="outside-before">
      <div id="target" clickOutside (clickOutside)="onClickOutside()">
        <span id="inside">inside</span>
      </div>
      <div id="outside-after">outside</div>
    </div>
  `,
})
class HostComponent {
  onClickOutside = () => {};
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;
  let targetEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: DOCUMENT, useValue: document }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    targetEl = fixture.debugElement.query(By.css('#target'));
    fixture.detectChanges();
  });

  it('deve emitir clickOutside quando clique fora do elemento', () => {
    const spy = vi.spyOn(component, 'onClickOutside');

    document.body.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('deve emitir clickOutside quando clique em elemento fora', () => {
    const spy = vi.spyOn(component, 'onClickOutside');
    const outsideEl = fixture.debugElement.query(By.css('#outside-before'));

    outsideEl.nativeElement.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('nao deve emitir clickOutside quando clique dentro do elemento', () => {
    const spy = vi.spyOn(component, 'onClickOutside');
    const insideEl = fixture.debugElement.query(By.css('#inside'));

    insideEl.nativeElement.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('deve emitir clickOutside quando clique no proprio elemento', () => {
    const spy = vi.spyOn(component, 'onClickOutside');

    targetEl.nativeElement.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('deve remover event listener no ngOnDestroy', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    fixture.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });
});

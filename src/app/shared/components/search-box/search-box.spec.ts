import { TestBed } from '@angular/core/testing';
import { SearchBox } from './search-box';

describe('SearchBox', () => {
  it('has an accessible label and emits the query on submit', () => {
    const fixture = TestBed.createComponent(SearchBox);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(el.querySelector(`label[for="${input.id}"]`)).not.toBeNull();

    const emitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((v) => emitted.push(v));
    input.value = 'ভর্তি';
    input.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(emitted).toEqual(['ভর্তি']);
  });

  it('clears the query', () => {
    const fixture = TestBed.createComponent(SearchBox);
    fixture.componentRef.setInput('value', 'abc');
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();
    expect(fixture.componentInstance.value()).toBe('');
  });
});

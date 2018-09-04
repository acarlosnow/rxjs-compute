import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, switchMap, exhaustMap, distinctUntilChanged, map, tap, mergeMap, concatMap, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data$: Observable<any>;
  compute$: Observable<any>;
  pendingCompute = 0;
  test = 0;
  title = 'app';
  form = this.formBuilder.group({
    price: [0],
    tax: [0]
  });

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {

  }

  ngOnInit() {
    const priceChanged$ = this.form.get('price').valueChanges.pipe(debounceTime(600), distinctUntilChanged());
    const taxChanged$ = this.form.get('tax').valueChanges.pipe(debounceTime(600), distinctUntilChanged());

    // priceChanged$.subscribe(x => console.log('price changed', x));
    // taxChanged$.subscribe(x => console.log('tax changed', x));

    const formChanges$ = merge(priceChanged$, taxChanged$);
    this.compute$ = formChanges$;

    this.compute$.pipe(
      tap(() => {
        this.pendingCompute++;
      }),
      map(() => {
        return this.form.value.tax;
      }),
      concatMap((tax) => this.http.get(`https://jsonplaceholder.typicode.com/todos?_limit=12&tax=${tax}&price=${this.test}`).pipe(tap(() => { this.pendingCompute--; }))),
      tap(() => {
        this.test++;
      }),
      filter(() => this.pendingCompute === 0),
    ).subscribe(x => console.log('computing', this.test, this.pendingCompute, x));
  }
}


import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, Subject, merge, pipe } from 'rxjs';
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
  list$: Observable<any>;
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
    const priceChanged$ = this.form.get('price').valueChanges.pipe(debounceTime(400), distinctUntilChanged(), map((val) => (deal) => {
      return {
        ...deal,
        price: val,
        formatted: true
      };
    }));
    const taxChanged$ = this.form.get('tax').valueChanges.pipe(debounceTime(400), distinctUntilChanged(), map((val) => (deal) => {
      return {
        ...deal,
        tax: val,
        formatted: true
      };
    }));

    const formChanges$ = merge(priceChanged$, taxChanged$);
    this.compute$ = formChanges$;

    this.list$ = this.compute$.pipe(
      tap(() => {
        this.test++;
        this.pendingCompute++;
      }),
      concatMap((callback) => {
        const request = {
          ...this.form.value,
          ...callback()
        };
        const val = request;
        return this.http.get(`https://jsonplaceholder.typicode.com/todos?_limit=${this.test}&tax=${val.tax}&price=${val.price}`)
      }),
      tap(() => {
        this.pendingCompute--;
      }),
      filter(() => this.pendingCompute === 0)
    );
  }
}



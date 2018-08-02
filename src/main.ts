import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/ngsw-worker.js');

  navigator.serviceWorker.addEventListener( 'push', ( event ) => {
    console.log( event );
  } )

  navigator.serviceWorker.addEventListener( 'push', ( event ) => {
    console.log( event );
  } )
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

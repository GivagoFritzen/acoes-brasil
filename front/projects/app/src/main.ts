import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/AppConfig';
import { App } from './app/AppComponent';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

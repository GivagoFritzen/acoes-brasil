import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/AppComponent';
import { config } from './app/AppConfigServer';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;

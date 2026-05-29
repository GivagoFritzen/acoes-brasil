import { Routes } from '@angular/router';
import { AcoesComponent } from '../pages/acoes/AcoesComponent';
import { AcaoDetailsComponent } from '../pages/acoes/details/AcaoDetailsComponent';
import { ExportacaoComponent } from '../pages/exportacao/ExportacaoComponent';
import { ImportacaoComponent } from '../pages/importacao/ImportacaoComponent';
import { OrdersComponent } from '../pages/orders/OrdersComponent';
import { ProventosComponent } from '../pages/proventos/ProventosComponent';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'acoes',
  },
  {
    path: 'acoes',
    component: AcoesComponent,
  },
  {
    path: 'acoes/:codigo',
    component: AcaoDetailsComponent,
  },
  {
    path: 'ordens',
    component: OrdersComponent,
  },
  {
    path: 'proventos',
    component: ProventosComponent,
  },
  {
    path: 'importacao',
    component: ImportacaoComponent,
  },
  {
    path: 'exportacao',
    component: ExportacaoComponent,
  },
];

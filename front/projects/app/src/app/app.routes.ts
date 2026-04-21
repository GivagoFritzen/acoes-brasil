import { Routes } from '@angular/router';
import { AcoesComponent } from '../pages/acoes/acoes.component';
import { AcaoDetailsComponent } from '../pages/acoes/details/acao-details.component';
import { ExportacaoComponent } from '../pages/exportacao/exportacao.component';
import { ImportacaoComponent } from '../pages/importacao/importacao.component';
import { OrdersComponent } from '../pages/orders/orders.component';
import { ProventosComponent } from '../pages/proventos/proventos.component';

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

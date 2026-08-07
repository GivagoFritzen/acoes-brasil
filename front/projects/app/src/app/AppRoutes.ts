import { Routes } from '@angular/router';
import { AcoesComponent } from '../pages/acoes/AcoesComponent';
import { AcaoDetailsComponent } from '../pages/acoes/details/AcaoDetailsComponent';
import { OrdersComponent } from '../pages/orders/OrdersComponent';
import { CustomizeComponent } from '../pages/personalizar/CustomizeComponent';
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
    loadComponent: () => import('../pages/importacao/ImportacaoComponent')
      .then(m => m.ImportacaoComponent),
  },
  {
    path: 'exportacao',
    loadComponent: () => import('../pages/exportacao/ExportacaoComponent')
      .then(m => m.ExportacaoComponent),
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('../pages/configuracoes/ConfiguracoesComponent')
      .then(m => m.ConfiguracoesComponent),
  },
  {
    path: 'personalizar',
    component: CustomizeComponent,
  },
];

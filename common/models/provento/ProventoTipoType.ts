import { ProventoTipos } from './ProventoTipoModel';

export type ProventoTipo = (typeof ProventoTipos)[keyof typeof ProventoTipos];

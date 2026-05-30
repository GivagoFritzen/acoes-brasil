export const ProventoTipos = {
  Dividendo: 'Dividendo',
  JurosSobreCapitalProprio: 'JurosSobreCapitalProprio',
  Rendimento: 'Rendimento',
} as const;

export type ProventoTipo = (typeof ProventoTipos)[keyof typeof ProventoTipos];
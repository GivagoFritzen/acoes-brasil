import { ProventoTipo } from "./provento.model";

export interface ProventosFilters {
    codigo: string;
    tipo: ProventoTipo | '';
    dataInicial: string;
    dataFinal: string;
    agruparPorCodigo: boolean;
}
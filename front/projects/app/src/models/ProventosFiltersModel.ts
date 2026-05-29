import { ProventoTipo } from "./ProventoModel";

export interface ProventosFilters {
    codigo: string;
    tipo: ProventoTipo | '';
    dataInicial: string;
    dataFinal: string;
    agruparPorCodigo: boolean;
}
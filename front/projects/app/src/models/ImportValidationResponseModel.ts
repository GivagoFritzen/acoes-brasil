import { ImportDivergence } from './ImportDivergenceModel';

export interface ImportValidationResponse {
    divergencias: ImportDivergence[];
    mensagem: string;
}

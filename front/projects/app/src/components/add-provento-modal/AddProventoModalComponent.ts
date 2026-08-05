import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { DatePickerComponent } from '../date-range-filter/DatePickerComponent';
import { SimpleButtonComponent } from '../simple-button/SimpleButtonComponent';
import { SimpleInputComponent } from '../simple-input/SimpleInputComponent';
import { SimpleSelectComponent } from '../simple-select/SimpleSelectComponent';
import { ProventoTipo, ProventoTipos, Provento } from '../../models';
import { SelectOption } from '../../../../../../common/models/SelectOptionModel';
import { CreateProventoPayload } from '../../models/CreateProventoPayloadModel';
import { SimpleInputNumberComponent } from '../simple-input-number/SimpleInputNumberComponent';
import { normalizeOrderCodigo } from '../../../../../../common/utils/OrderCodigoUtils';
import { isSupportedB3Ticker } from '../../../../../../common/utils/AssetTypeUtils';
import { isFutureDate } from '../../utils/DateUtils';

@Component({
  selector: 'app-add-provento-modal',
  standalone: true,
  imports: [CommonModule, SimpleInputComponent, SimpleSelectComponent, DatePickerComponent, SimpleButtonComponent, SimpleInputNumberComponent],
  templateUrl: './AddProventoModalComponent.html',
  styleUrls: ['./AddProventoModalComponent.scss'],
})
export class AddProventoModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() tipoOptions: SelectOption<ProventoTipo>[] = [];
  @Input() editingItem: Provento | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreateProventoPayload>();

  codigo = signal('');
  tipo = signal<ProventoTipo>(ProventoTipos.Dividendo);
  instituicao = signal('');
  quantidade = signal<number | null>(null);
  precoUnitario = signal<number | null>(null);
  valorLiquido = signal<number | null>(null);
  data = signal('');
  validationMessage = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen']?.previousValue) {
      this.resetForm();
      if (this.editingItem) {
        this.populateForm(this.editingItem);
      }
    }
  }

  close(): void {
    if (this.isSaving) {
      return;
    }

    this.closed.emit();
  }

  handleBackdropClick(): void {
    this.close();
  }

  handleCodigoChange(value: string): void {
    this.codigo.set(normalizeOrderCodigo(value));
  }

  handleTipoChange(value: string): void {
    this.tipo.set(value as ProventoTipo);
  }

  handleInstituicaoChange(value: string): void {
    this.instituicao.set(value);
  }

  handleQuantidadeChange(value: string): void {
    const parsed = Number(value);
    this.quantidade.set(Number.isFinite(parsed) ? parsed : null);
  }

  handlePrecoUnitarioChange(value: string): void {
    const parsed = Number(value);
    this.precoUnitario.set(Number.isFinite(parsed) ? parsed : null);
  }

  handleValorLiquidoChange(value: string): void {
    const parsed = Number(value);
    this.valorLiquido.set(Number.isFinite(parsed) ? parsed : null);
  }

  handleDataChange(value: string): void {
    this.data.set(value);
  }

  submit(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.saved.emit(payload);
  }

  private buildPayload(): CreateProventoPayload | null {
    const codigo = normalizeOrderCodigo(this.codigo());
    const instituicao = this.instituicao().trim();
    const quantidade = this.quantidade();
    const precoUnitario = this.precoUnitario();
    const valorLiquido = this.valorLiquido();
    const data = this.data().trim();

    if (
      !codigo ||
      !instituicao ||
      !data ||
      quantidade === null ||
      quantidade <= 0 ||
      precoUnitario === null ||
      precoUnitario < 0 ||
      valorLiquido === null ||
      valorLiquido < 0
    ) {
      this.validationMessage.set('Preencha todos os campos com valores válidos.');
      return null;
    }

    if (isFutureDate(data)) {
      this.validationMessage.set('A data do provento não pode ser futura.');
      return null;
    }

    if (!isSupportedB3Ticker(codigo)) {
      this.validationMessage.set('Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações (ex.: PETR4F, TAEE11, AAPL34).');
      return null;
    }

    this.validationMessage.set('');

    return {
      codigo,
      tipo: this.tipo(),
      instituicao,
      quantidade: Math.trunc(quantidade),
      precoUnitario,
      valorLiquido,
      data,
    };
  }

  private resetForm(): void {
    this.codigo.set('');
    this.tipo.set(ProventoTipos.Dividendo);
    this.instituicao.set('');
    this.quantidade.set(null);
    this.precoUnitario.set(null);
    this.valorLiquido.set(null);
    this.data.set('');
    this.validationMessage.set('');
  }

  private populateForm(item: Provento): void {
    this.codigo.set(item.codigo);
    this.tipo.set(item.tipo);
    this.instituicao.set(item.instituicao);
    this.quantidade.set(item.quantidade);
    this.precoUnitario.set(item.precoUnitario);
    this.valorLiquido.set(item.valorLiquido);
    this.data.set(item.data);
  }
}
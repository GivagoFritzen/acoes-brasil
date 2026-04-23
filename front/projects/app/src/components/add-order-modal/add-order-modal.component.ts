import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { DatePickerComponent } from '../date-range-filter/date-picker.component';
import { SimpleButtonComponent } from '../simple-button/simple-button.component';
import { SimpleInputComponent } from '../simple-input/simple-input.component';
import { SimpleInputNumberComponent } from '../simple-input-number/simple-input-number.component';
import { SimpleSelectComponent } from '../simple-select/simple-select.component';
import { OrderOperacao, OrderTipo } from '../../models';
import { SelectOption } from '../../../../../../common/models/select-option.model';
import { CreateOrderPayload } from '../../models/create-order-payload.model';
import { normalizeOrderCodigo } from '../../../../../../common/utils/order-codigo.utils';
import { detectSupportedAssetTypeFromTicker } from '../../../../../../common/utils/asset-type.utils';

@Component({
  selector: 'app-add-order-modal',
  standalone: true,
  imports: [CommonModule, SimpleInputComponent, SimpleInputNumberComponent, SimpleSelectComponent, DatePickerComponent, SimpleButtonComponent],
  templateUrl: './add-order-modal.component.html',
  styleUrls: ['./add-order-modal.component.scss'],
})
export class AddOrderModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() operacaoOptions: SelectOption<OrderOperacao>[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreateOrderPayload>();

  codigo = signal('');
  operacao = signal<OrderOperacao>('Compra');
  quantidade = signal<number | null>(null);
  valor = signal<number | null>(null);
  data = signal('');
  validationMessage = signal('');

  tipoDetectado = signal<OrderTipo | null>(null);
  readonly tipoOptions: SelectOption<OrderTipo>[] = [
    { label: 'Ação', value: 'ACAO' },
    { label: 'FII', value: 'FII' },
    { label: 'BDR', value: 'BDR' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen']?.previousValue) {
      this.resetForm();
    }
  }

  close(): void {
    if (this.isSaving) return;
    this.closed.emit();
  }

  handleBackdropClick(): void {
    this.close();
  }

  handleCodigoChange(value: string): void {
    const codigo = normalizeOrderCodigo(value);
    this.codigo.set(codigo);
    this.tipoDetectado.set(detectSupportedAssetTypeFromTicker(codigo));
  }

  handleOperacaoChange(value: string): void {
    this.operacao.set(value as OrderOperacao);
  }

  handleQuantidadeChange(value: string): void {
    const parsed = Number(value);
    this.quantidade.set(Number.isFinite(parsed) ? parsed : null);
  }

  handleValorChange(value: string): void {
    const parsed = Number(value);
    this.valor.set(Number.isFinite(parsed) ? parsed : null);
  }

  handleDataChange(value: string): void {
    this.data.set(value);
  }

  submit(): void {
    const payload = this.buildPayload();
    if (!payload) return;
    this.saved.emit(payload);
  }

  private buildPayload(): CreateOrderPayload | null {
    const codigo = normalizeOrderCodigo(this.codigo());
    const quantidade = this.quantidade();
    const valor = this.valor();
    const data = this.data().trim();
    const tipoDetectado = detectSupportedAssetTypeFromTicker(codigo);

    if (!codigo || !data || quantidade === null || quantidade <= 0 || valor === null || valor <= 0) {
      this.validationMessage.set('Preencha todos os campos com valores válidos.');
      return null;
    }

    if (!tipoDetectado) {
      this.validationMessage.set('Código inválido para padrões suportados da B3 (ex.: PETR4, HGLG11, AAPL34).');
      return null;
    }

    if (this.isFutureDate(data)) {
      this.validationMessage.set('A data da ordem não pode ser futura.');
      return null;
    }

    this.validationMessage.set('');

    return {
      codigo,
      operacao: this.operacao(),
      tipo: tipoDetectado,
      quantidade: Math.trunc(quantidade),
      valor,
      data,
    };
  }

  private isFutureDate(value: string): boolean {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed.getTime() > today.getTime();
  }

  private resetForm(): void {
    this.codigo.set('');
    this.operacao.set('Compra');
    this.tipoDetectado.set(null);
    this.quantidade.set(null);
    this.valor.set(null);
    this.data.set('');
    this.validationMessage.set('');
  }
}
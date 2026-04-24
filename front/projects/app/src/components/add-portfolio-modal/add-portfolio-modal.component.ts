import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { SimpleButtonComponent } from '../simple-button/simple-button.component';
import { SimpleInputComponent } from '../simple-input/simple-input.component';
import { SimpleInputNumberComponent } from '../simple-input-number/simple-input-number.component';
import { CreatePortfolioPayload } from '../../models/create-portfolio-payload.model';
import { isSupportedB3Ticker } from '../../../../../../common/utils/asset-type.utils';
import { normalizeOrderCodigo } from '../../../../../../common/utils/order-codigo.utils';

@Component({
  selector: 'app-add-portfolio-modal',
  standalone: true,
  imports: [CommonModule, SimpleInputComponent, SimpleButtonComponent, SimpleInputNumberComponent],
  templateUrl: './add-portfolio-modal.component.html',
  styleUrls: ['./add-portfolio-modal.component.scss'],
})
export class AddPortfolioModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreatePortfolioPayload>();

  codigo = signal('');
  quantidade = signal<number | null>(null);
  precoMedio = signal<number | null>(null);
  validationMessage = signal('');

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
    this.codigo.set(normalizeOrderCodigo(value));
  }


  handleQuantidadeChange(value: string): void {
    const parsed = Number(value);
    this.quantidade.set(Number.isFinite(parsed) ? parsed : null);
  }

  handlePrecoMedioChange(value: string): void {
    const parsed = Number(value);
    this.precoMedio.set(Number.isFinite(parsed) ? parsed : null);
  }

  submit(): void {
    const payload = this.buildPayload();
    if (!payload) return;
    this.saved.emit(payload);
  }

  private buildPayload(): CreatePortfolioPayload | null {
    const codigo = normalizeOrderCodigo(this.codigo());
    const quantidade = this.quantidade();
    const precoMedio = this.precoMedio();

    if (!codigo || quantidade === null || quantidade <= 0 || precoMedio === null || precoMedio < 0) {
      this.validationMessage.set('Preencha todos os campos com valores válidos.');
      return null;
    }

    if (!isSupportedB3Ticker(codigo)) {
      this.validationMessage.set('Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações (ex.: PETR04F, TAEE11, AAPL34).');
      return null;
    }

    this.validationMessage.set('');

    return {
      codigo,
      quantidade: Math.trunc(quantidade),
      precoMedio,
    };
  }

  private resetForm(): void {
    this.codigo.set('');
    this.quantidade.set(null);
    this.precoMedio.set(null);
    this.validationMessage.set('');
  }
}
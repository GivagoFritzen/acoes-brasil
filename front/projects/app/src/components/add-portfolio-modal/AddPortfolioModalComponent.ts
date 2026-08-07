import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { SimpleButtonComponent } from '../simple-button/SimpleButtonComponent';
import { SimpleInputComponent } from '../simple-input/SimpleInputComponent';
import { SimpleInputNumberComponent } from '../simple-input-number/SimpleInputNumberComponent';
import { CreatePortfolioPayload } from '../../models/CreatePortfolioPayloadModel';
import { PortfolioItem } from '../../models';
import { isSupportedB3Ticker } from '../../../../../../common/utils/AssetTypeUtils';
import { normalizeOrderCodigo } from '../../../../../../common/utils/OrderCodigoUtils';
import { TranslationService } from '../../services/TranslationService';
import { TranslatePipe } from '../../pipes/TranslatePipe';

@Component({
  selector: 'app-add-portfolio-modal',
  standalone: true,
  imports: [CommonModule, SimpleInputComponent, SimpleButtonComponent, SimpleInputNumberComponent, TranslatePipe],
  templateUrl: './AddPortfolioModalComponent.html',
  styleUrls: ['./AddPortfolioModalComponent.scss'],
})
export class AddPortfolioModalComponent implements OnChanges {
  private readonly translationService = inject(TranslationService);
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() editingItem: PortfolioItem | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreatePortfolioPayload>();

  codigo = signal('');
  quantidade = signal<number | null>(null);
  precoMedio = signal<number | null>(null);
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
      this.validationMessage.set(this.translationService.get('orders.validation.fillAllFields'));
      return null;
    }

    if (!isSupportedB3Ticker(codigo)) {
      this.validationMessage.set(this.translationService.get('orders.validation.invalidCode'));
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

  private populateForm(item: PortfolioItem): void {
    this.codigo.set(item.codigo);
    this.quantidade.set(item.quantidade);
    this.precoMedio.set(item.precoMedio);
  }
}
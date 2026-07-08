import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';
import { SettingsService } from '../../services/SettingsService';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './ConfiguracoesComponent.html',
  styleUrls: ['./ConfiguracoesComponent.scss'],
})
export class ConfiguracoesComponent {
  private translationService = inject(TranslationService);
  settingsService = inject(SettingsService);

  readonly languages: { code: string; name: string }[] = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en-US', name: 'Inglês' },
  ];

  async selecionarIdioma(code: string): Promise<void> {
    this.settingsService.setLanguage(code);
    await this.translationService.loadLanguage(code);
  }

  alternarTema(): void {
    const novo = this.settingsService.theme() === 'dark' ? 'light' : 'dark';
    this.settingsService.setTheme(novo);
  }
}

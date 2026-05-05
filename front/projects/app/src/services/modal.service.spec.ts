import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    service = new ModalService();
  });

  it('deve abrir e fechar modal de criação', () => {
    service.openCreateModal();
    expect(service.isCreateModalOpen()).toBe(true);

    service.closeCreateModal();
    expect(service.isCreateModalOpen()).toBe(false);
  });

  it('deve fechar todos os modais', () => {
    service.openCreateModal();
    service.isDeleteModalOpen.set(true);

    service.closeAllModals();

    expect(service.hasOpenModals()).toBe(false);
  });
});

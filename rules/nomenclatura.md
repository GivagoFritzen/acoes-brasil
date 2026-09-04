# Nomenclatura de Arquivos e Diretórios

## Regras Gerais

- Todos os arquivos usam **PascalCase**
- Todos os diretórios usam **kebab-case**
- O nome do arquivo deve descrever claramente sua responsabilidade
- Utilizar sufixos para identificar o tipo do arquivo (`Service`, `Controller`, `Dto`, etc.)
- Evitar abreviações desnecessárias

---

## Padrões de Arquivos

| Tipo | Padrão | Exemplo |
|---|---|---|
| Classe | `Nome.ts` | `CreateOrderService.ts` |
| Interface | `INomeService.ts` | `IOrderRepository.ts` |
| Type / DTO | `NomeTipo.ts` | `OrderAttributes.ts`, `CreateOrderDto.ts` |
| Controller | `NomeController.ts` | `OrderController.ts` |
| Service | `NomeService.ts` | `OrderService.ts` |
| Repository | `NomeRepository.ts` | `OrderRepository.ts` |
| Entity | `NomeEntity.ts` | `OrderEntity.ts` |
| Routes | `NomeRoutes.ts` | `OrderRoutes.ts` |
| Middleware | `NomeMiddleware.ts` | `AuthMiddleware.ts` |
| Guard | `NomeGuard.ts` | `AdminGuard.ts` |
| Configuração | `NomeConfig.ts` | `JestConfig.ts` |
| Migration | `Nome.ts` | `CreateOrders20260207.ts` |
| Seeder | `NomeSeeder.ts` | `OrderSeeder.ts` |
| Factory | `NomeFactory.ts` | `OrderFactory.ts` |
| Utilitário | `Nome.ts` | `DateExpression.ts` |
| Constantes | `NomeConstants.ts` | `OrderConstants.ts` |
| Enum | `NomeEnum.ts` | `OrderStatusEnum.ts` |
| Validação | `NomeValidator.ts` | `CreateOrderValidator.ts` |
| Componente Angular | `NomeComponent.ts` | `OrderCardComponent.ts` |
| Template Componente | `NomeComponent.html` | `OrderCardComponent.html` |
| Estilo Componente | `NomeComponent.scss` | `OrderCardComponent.scss` |
| Página | `NomeComponent.ts` | `OrdersComponent.ts` |
| Store / Estado | `NomeStore.ts` | `OrdersStore.ts` |
| Pipe | `NomePipe.ts` | `TranslatePipe.ts` |
| Interceptor | `NomeInterceptor.ts` | `AuthInterceptor.ts` |

---

## Exceções Permitidas

- Arquivos de entrada e barrel export do ecossistema: `index.ts`, `server.ts`, `main.ts`, `test-setup.ts`
- Arquivos de configuração de ferramentas: `angular.json`, `package.json`, `tsconfig*.json`, `vitest.config.ts`, `sonar-project.properties`
- Estilos globais de base: `styles.scss`, `colors.scss`, `fonts.scss`

---

## Testes

- Arquivos de teste usam o mesmo nome do arquivo principal
- Sufixo obrigatório: `.spec.ts`
- Devem ficar na mesma pasta do arquivo testado

### Exemplos

```txt
CreateOrderService.ts
CreateOrderService.spec.ts

OrderRoutes.ts
OrderRoutes.spec.ts
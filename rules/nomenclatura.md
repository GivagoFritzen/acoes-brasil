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
| Interface | `INome.ts` | `IOrderRepository.ts` |
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
| Hook | `useNome.ts` | `useAuth.ts` |
| Componente React | `Nome.tsx` | `OrderCard.tsx` |
| Página | `NomePage.tsx` | `OrdersPage.tsx` |

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
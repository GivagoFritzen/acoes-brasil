# PRD: Refatoração Arquitetural Backend

**Sequência**: 001
**Ticket**: TBD
**Versão**: 1
**Data**: 2026-04-28
**Status**: 🟢 PRONTO PARA IMPLEMENTAÇÃO

**Metadados**
- **Prioridade**: Alta
- **Complexidade**: 🔴 Alta — 5+ componentes, múltiplos módulos, sem migrations
- **Repositório(s)**: acoes/back

---

## 1. VISÃO GERAL

### 1.1. Contexto
O backend atual possui lógica de negócio distribuída em camadas erradas: regras de domínio e de aplicação estão em controllers e diretamente em arquivos de rota (`portfolioRoutes.ts`, `proventoRoutes.ts`, `fundamentusRoutes.ts`). Isso viola SRP, OCP, DIP e torna o código difícil de testar, reutilizar e manter. O módulo de portfolio teve sua camada de domínio e repositório iniciados mas ainda não possui use cases nem controller. Os módulos de provento e fundamentus não possuem nenhuma estrutura de camadas.

### 1.2. Objetivo
Reestruturar todos os módulos do backend (order, import, portfolio, provento, fundamentus) para que cada camada tenha responsabilidade única: rotas delegam para controllers, controllers delegam para use cases, use cases contêm regras de negócio, repositórios acessam dados. Nenhum controller ou rota deve conter lógica de negócio, cálculos financeiros, parsing de dados ou acesso direto a modelos.

---

## 2. CRITÉRIOS DE ACEITAÇÃO

### Critério 1 — Controllers sem lógica de negócio
**Dado** que existe uma requisição HTTP para qualquer endpoint
**Quando** o controller recebe a requisição
**Então** o controller apenas extrai os dados da requisição, chama o use case correspondente e retorna a resposta
**E** nenhum cálculo, validação de regra de negócio ou acesso direto a modelo ocorre no controller

### Critério 2 — Rotas sem lógica de negócio
**Dado** qualquer arquivo de rota (`portfolioRoutes`, `proventoRoutes`, `fundamentusRoutes`, `orderRoutes`)
**Quando** uma requisição chega
**Então** a rota apenas instancia o controller via DI e chama o método correspondente
**E** nenhum cálculo, normalização, validação ou acesso a modelo ocorre diretamente na rota

### Critério 3 — Módulo Portfolio com estrutura completa
**Dado** que o módulo de portfolio possui entity e repositório implementados
**Quando** uma operação de criar/atualizar, listar ou deletar portfolio é solicitada
**Então** a requisição flui por Controller → UseCase → Repository
**E** os use cases existentes (`CreateOrUpdatePortfolioUseCase`, `DeletePortfolioUseCase`, `ListPortfolioUseCase`) são utilizados

### Critério 4 — Módulo Provento com estrutura completa
**Dado** que o módulo de provento não possui nenhuma camada de aplicação
**Quando** uma operação de criar, importar ou listar proventos é solicitada
**Então** a requisição flui por `ProventoController` → UseCase → `SequelizeProventoRepository`
**E** a lógica de agrupamento, filtros e importação está nos use cases, não na rota

### Critério 5 — Módulo Fundamentus com controller dedicado
**Dado** que `fundamentusRoutes.ts` possui parsing de HTML (~128 linhas) diretamente na rota
**Quando** uma consulta de dados de ação é solicitada via `GET /:codigo`
**Então** a requisição flui por `FundamentusController` → `FundamentusService` (web scraping)
**E** toda lógica de parsing HTML, normalização de labels e extração de indicadores está no serviço, não na rota

### Critério 6 — Módulo Order com controller limpo
**Dado** que `OrderController` possui cálculos financeiros, normalização de inputs e lógica de exportação Excel
**Quando** qualquer endpoint de order é chamado
**Então** o controller não contém cálculos de custo, ganho/perda, formatação de planilha ou mapeamento de resposta complexo
**E** essas responsabilidades estão em use cases ou serviços dedicados

### Critério 7 — Módulo Import com controller limpo
**Dado** que `ImportController` possui parsing de planilha, transformação de dados e validação inline
**Quando** um arquivo é importado via `POST /orders/import`
**Então** o controller apenas recebe o buffer do arquivo e chama o use case
**E** toda lógica de parsing, normalização e validação de linhas está em serviço dedicado

### Critério 8 — Injeção de dependência para todos os use cases novos
**Dado** que novos use cases são criados para portfolio, provento e fundamentus
**Quando** a aplicação inicializa
**Então** todos os use cases estão registrados no `service-registration.ts` via Container
**E** os controllers os recebem via DI, sem instanciação manual

---

## 3. ESCOPO TÉCNICO

### 3.1. Componentes a Alterar

**Controllers existentes:**
- `back/src/controllers/OrderController.ts` — remover cálculos financeiros, normalização de inputs e lógica de exportação Excel
- `back/src/controllers/ImportController.ts` — remover parsing de planilha, transformação e validação inline

**Rotas existentes:**
- `back/src/routes/portfolioRoutes.ts` — substituir lógica inline por chamadas ao `PortfolioController`
- `back/src/routes/proventoRoutes.ts` — substituir lógica inline por chamadas ao `ProventoController`
- `back/src/routes/fundamentusRoutes.ts` — substituir parsing inline por chamadas ao `FundamentusController`
- `back/src/routes/orderRoutes.ts` — revisar e ajustar se necessário

**DI:**
- `back/src/shared/dependency-injection/service-registration.ts` — registrar todos os novos use cases e serviços

### 3.2. Componentes Novos

**Portfolio (camada de aplicação faltante):**
- `back/src/application/dto/CreateOrUpdatePortfolioDto.ts`
- `back/src/application/use-cases/CreateOrUpdatePortfolioUseCase.ts`
- `back/src/application/use-cases/DeletePortfolioUseCase.ts`
- `back/src/application/use-cases/ListPortfolioUseCase.ts`
- `back/src/controllers/PortfolioController.ts`

**Provento (estrutura completa):**
- `back/src/domain/entities/ProventoEntity.ts`
- `back/src/domain/interfaces/IProventoRepository.ts`
- `back/src/infrastructure/repositories/SequelizeProventoRepository.ts`
- `back/src/application/dto/CreateProventoDto.ts`
- `back/src/application/use-cases/CreateProventoUseCase.ts`
- `back/src/application/use-cases/ImportProventosUseCase.ts`
- `back/src/application/use-cases/ListProventosUseCase.ts`
- `back/src/controllers/ProventoController.ts`

**Fundamentus (controller + serviço):**
- `back/src/controllers/FundamentusController.ts`
- `back/src/infrastructure/services/FundamentusScraperService.ts` (extrair lógica de parsing do HTML da rota)

**Order (use cases e serviços faltantes):**
- `back/src/application/use-cases/GetSellSnapshotsUseCase.ts`
- `back/src/application/use-cases/ExportSellSnapshotsUseCase.ts`
- `back/src/infrastructure/services/ExcelExportService.ts`
- `back/src/infrastructure/services/SpreadsheetParserService.ts`

### 3.3. Componentes Existentes (Reutilizar)

- `back/src/domain/entities/PortfolioEntity.ts` — reutilizado sem alteração (já possui `registerCompra` e `registerVenda`)
- `back/src/domain/interfaces/IPortfolioRepository.ts` — reutilizado
- `back/src/infrastructure/repositories/SequelizePortfolioRepository.ts` — reutilizado
- `back/src/domain/entities/OrderEntity.ts` — reutilizado
- `back/src/domain/interfaces/IOrderRepository.ts` — reutilizado
- `back/src/infrastructure/repositories/SequelizeOrderRepository.ts` — reutilizado
- `back/src/application/use-cases/CreateOrderUseCase.ts` — reutilizado
- `back/src/application/use-cases/DeleteOrderUseCase.ts` — reutilizado
- `back/src/application/use-cases/ListOrdersUseCase.ts` — reutilizado
- `back/src/shared/dependency-injection/Container.ts` — reutilizado
- `back/src/shared/error-handler/ErrorHandler.ts` — reutilizado
- `back/src/shared/validators/OrderValidator.ts` — reutilizado
- `back/src/shared/utils/DateUtils.ts` — reutilizado
- `back/src/infrastructure/services/FundamentusQuoteProvider.ts` — reutilizado (provê cotação atual; scraper detalhado vai para `FundamentusScraperService`)
- `back/src/utils/spreadsheet.ts` — reutilizado pelo `SpreadsheetParserService`

### 3.4. Fluxo de Dados

**Order (criar/listar/deletar):**
```
HTTP Request → orderRoutes → OrderController → [UseCase] → IOrderRepository → Database
```

**Order (exportar sell snapshots):**
```
HTTP Request → orderRoutes → OrderController → ExportSellSnapshotsUseCase → IOrderSellSnapshotRepository
                                                                           → ExcelExportService → Buffer XLSX → Response
```

**Import (planilha):**
```
HTTP Request (multipart) → orderRoutes → ImportController → SpreadsheetParserService (parse rows)
                                                          → ImportOrdersUseCase → IOrderRepository → Database
```

**Portfolio:**
```
HTTP Request → portfolioRoutes → PortfolioController → [UseCase] → IPortfolioRepository → Database
```

**Provento (criar/listar/importar):**
```
HTTP Request → proventoRoutes → ProventoController → [UseCase] → IProventoRepository → Database
```

**Fundamentus (web scraping):**
```
HTTP Request → fundamentusRoutes → FundamentusController → FundamentusScraperService → HTTP externo (Fundamentus)
```

---

## 4. ESPECIFICAÇÕES TÉCNICAS

### 4.1. Entidades

**ProventoEntity (nova)**
```
ProventoEntity
+ id: string
+ codigo: string
+ tipo: ProventoTipo
+ quantidade: number
+ valorLiquido: number
+ precoUnitario: number
+ dataCom: string (formato BR)
+ dataPagamento: string (formato BR)
+ createdAt?: Date
+ updatedAt?: Date
```

### 4.2. DTOs / Commands

**CreateOrUpdatePortfolioDto**
```
+ codigo: string (obrigatório, normalizado)
+ quantidade: number (obrigatório, > 0)
+ precoMedio: number (obrigatório, >= 0)
```

**CreateProventoDto**
```
+ codigo: string (obrigatório, normalizado)
+ tipo: ProventoTipo (obrigatório)
+ quantidade: number (obrigatório, > 0)
+ valorLiquido: number (obrigatório, >= 0)
+ dataCom: string (obrigatório, formato BR)
+ dataPagamento: string (obrigatório, formato BR)
```

### 4.3. Use Cases / Services

**CreateOrUpdatePortfolioUseCase**
- Recebe `CreateOrUpdatePortfolioDto`
- Busca portfolio existente por codigo via repositório
- Se existir: chama `registerCompra` na entity e salva
- Se não existir: cria nova entry via repositório
- Retorna `PortfolioEntity`

**DeletePortfolioUseCase**
- Recebe `id` do portfolio
- Verifica existência via repositório
- Se não existir: lança erro 404
- Se existir: deleta via repositório

**ListPortfolioUseCase**
- Sem parâmetros ou com filtros opcionais
- Retorna lista de `PortfolioEntity` ordenada por `createdAt DESC`

**CreateProventoUseCase**
- Recebe `CreateProventoDto`
- Valida regras de negócio (data futura, tipo válido)
- Persiste via `IProventoRepository`

**ImportProventosUseCase**
- Recebe linhas já parseadas de planilha
- Valida cada linha (tipo, datas, valores)
- Persiste em transação via `IProventoRepository`
- Retorna contagem de importados e erros por linha

**ListProventosUseCase**
- Recebe filtros (codigo, tipo, data início, data fim, página, limite)
- Retorna lista paginada agrupada por codigo + tipo com agregações (soma quantidade, soma valorLiquido, média precoUnitario)

**GetSellSnapshotsUseCase**
- Recebe filtros opcionais
- Consulta `IOrderSellSnapshotRepository`
- Retorna lista de snapshots mapeados para resposta

**ExportSellSnapshotsUseCase**
- Recebe filtros opcionais
- Consulta `IOrderSellSnapshotRepository`
- Calcula `custoMedioTotal = precoMedioAtual * quantidade` e `valorVendaTotal = valorAtualAcao * quantidade`
- Se `ganhos === 0`, recalcula como `valorVendaTotal - custoMedioTotal`
- Delega geração do arquivo ao `ExcelExportService`
- Retorna buffer XLSX

**SpreadsheetParserService**
- Lê buffer de arquivo via `readSpreadsheetRows`
- Extrai campos com nomes alternativos (ex: "Código de Negociação" / "Codigo de Negociacao")
- Parseia decimais de formatos variados (ex: "R$ 100,50")
- Normaliza datas para formato BR
- Determina `operacao` (Compra/Venda) a partir de texto
- Determina `tipo` a partir do ticker
- Retorna lista de linhas transformadas

**ExcelExportService**
- Recebe dados já calculados
- Gera arquivo XLSX com colunas e formatação adequadas
- Retorna buffer do arquivo

**FundamentusScraperService**
- Recebe `codigo` normalizado
- Realiza requisição HTTP ao Fundamentus
- Parseia HTML: `decodeHtmlEntities`, `stripHtml`, `normalizeLabel`, extração de indicadores
- Retorna objeto `FundamentusAcaoDetails`

### 4.4. Repositories

**IProventoRepository (nova interface)**
- `createAsync(provento: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">, tx?): Promise<ProventoEntity>`
- `createManyAsync(proventos: Array<Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">>, tx?): Promise<ProventoEntity[]>`
- `findAllAsync(filtros: IProventoFilters): Promise<{ rows: ProventoEntity[]; count: number }>`

**IPortfolioRepository (ampliar se necessário)**
- `findAllAsync(tx?): Promise<PortfolioEntity[]>`
- `findByIdAsync(id: string, tx?): Promise<PortfolioEntity | null>`
- Métodos existentes mantidos: `createAsync`, `findByCodigoAsync`, `saveAsync`, `deleteByCodigoAsync`

### 4.5. Validações

**Portfolio:**
- `codigo`: obrigatório, normalizado, deve ser ticker B3 válido (`isSupportedB3Ticker`)
- `quantidade`: obrigatório, número finito, > 0
- `precoMedio`: obrigatório, número finito, >= 0

**Provento:**
- `codigo`: obrigatório, normalizado
- `tipo`: obrigatório, valor de `ProventoTipo`
- `quantidade`: obrigatório, > 0
- `valorLiquido`: obrigatório, >= 0
- `dataCom`: obrigatório, data válida, não futura
- `dataPagamento`: obrigatório, data válida

**Import (planilha):**
- Cada linha deve ter `codigo`, `operacao` identificável e `data` válida
- Linhas com campos faltantes são reportadas como erro (não abortam a importação)

---

## 5. REGRAS DE NEGÓCIO

- **RN01**: Nenhum controller deve conter cálculos financeiros, normalizações de domínio ou acesso direto a modelos Sequelize
- **RN02**: Nenhuma rota deve conter lógica além de instanciar o controller e mapear o método HTTP ao método do controller
- **RN03**: O cálculo de preço médio ponderado ao adicionar posição ao portfolio deve ocorrer exclusivamente em `PortfolioEntity.registerCompra`
- **RN04**: O cálculo de ganho/perda em exportação de sell snapshots deve ocorrer no `ExportSellSnapshotsUseCase`, não no controller
- **RN05**: O parsing de planilha (extração de campos, normalização de tipos e valores) deve ocorrer exclusivamente no `SpreadsheetParserService`
- **RN06**: O parsing de HTML do Fundamentus deve ocorrer exclusivamente no `FundamentusScraperService`
- **RN07**: A lógica de agrupamento e agregação de proventos deve ocorrer no `ListProventosUseCase` ou no repositório, não na rota
- **RN08**: Todos os use cases novos devem ser registrados no Container de DI antes de serem utilizados
- **RN09**: A importação de proventos deve ser executada dentro de uma transação; falha em qualquer item deve realizar rollback

---

## 6. REQUISITOS FUNCIONAIS

- **RF01**: `POST /portfolio` cria ou atualiza portfolio passando por `PortfolioController` → `CreateOrUpdatePortfolioUseCase`
- **RF02**: `GET /portfolio` lista portfolios passando por `PortfolioController` → `ListPortfolioUseCase`
- **RF03**: `DELETE /portfolio/:id` deleta portfolio passando por `PortfolioController` → `DeletePortfolioUseCase`
- **RF04**: `POST /provento` cria provento passando por `ProventoController` → `CreateProventoUseCase`
- **RF05**: `POST /provento/import` importa planilha de proventos passando por `ProventoController` → `SpreadsheetParserService` → `ImportProventosUseCase`
- **RF06**: `GET /provento` lista proventos agrupados/filtrados passando por `ProventoController` → `ListProventosUseCase`
- **RF07**: `GET /fundamentus/:codigo` retorna dados da ação passando por `FundamentusController` → `FundamentusScraperService`
- **RF08**: `GET /orders/export/sell-snapshots` exporta planilha XLSX passando por `OrderController` → `ExportSellSnapshotsUseCase` → `ExcelExportService`
- **RF09**: `GET /orders/export/sell-snapshots/data` retorna dados de sell snapshots passando por `OrderController` → `GetSellSnapshotsUseCase`
- **RF10**: `POST /orders/import` importa planilha de ordens passando por `ImportController` → `SpreadsheetParserService` → `ImportOrdersUseCase`

---

## 7. REQUISITOS NÃO FUNCIONAIS

- **RNF01**: O comportamento externo de todos os endpoints deve permanecer idêntico ao atual — mesmos payloads de request e response, mesmos status codes
- **RNF02**: Nenhuma migration de banco de dados é necessária — apenas refatoração de código
- **RNF03**: Todos os use cases devem depender de interfaces (injeção via construtor), nunca de implementações concretas
- **RNF04**: A aplicação deve compilar sem erros após a refatoração (`npm run build` ou equivalente)

---

## 8. MIGRATIONS

**Migration necessária?** ☑ Não

Nenhuma alteração de banco de dados é necessária. A refatoração é exclusivamente na camada de código.

---

## 9. TRATAMENTO DE ERROS

### CE01 — Portfolio não encontrado ao deletar
- **Situação**: `DELETE /portfolio/:id` com id inexistente
- **Tratamento**: UseCase retorna erro 404
- **Mensagem**: `"Ativo do portfólio não encontrado."`

### CE02 — Dados inválidos ao criar/atualizar portfolio
- **Situação**: `codigo`, `quantidade` ou `precoMedio` inválidos
- **Tratamento**: Controller retorna 400 antes de chamar use case
- **Mensagem**: `"Dados inválidos para criar/atualizar portfolio."`

### CE03 — Ticker inválido no portfolio
- **Situação**: `codigo` não passa em `isSupportedB3Ticker`
- **Tratamento**: UseCase ou validação no controller retorna 400
- **Mensagem**: `"Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações."`

### CE04 — Linhas inválidas na importação de proventos
- **Situação**: Linhas da planilha com campos obrigatórios faltando
- **Tratamento**: `ImportProventosUseCase` registra erros por linha, continua as demais, retorna relatório
- **Mensagem**: `"Linha X: campo Y é obrigatório"`

### CE05 — Erro no web scraping do Fundamentus
- **Situação**: Falha na requisição HTTP ou parsing do HTML
- **Tratamento**: `FundamentusScraperService` lança erro, controller retorna 502 ou 404
- **Mensagem**: `"Erro ao buscar dados para o código informado."`

### CE06 — Arquivo não enviado na importação
- **Situação**: `POST /orders/import` sem arquivo
- **Tratamento**: Controller retorna 400
- **Mensagem**: `"Nenhum arquivo enviado."`

---

## 10. CASOS DE USO

### UC01: Criar ou Atualizar Portfolio

**Ator:** Usuário via API

**Pré-Condições:**
- Body contém `codigo`, `quantidade`, `precoMedio`

**Fluxo Principal:**
1. `portfolioRoutes` recebe `POST /` e delega ao `PortfolioController.createOrUpdateAsync`
2. Controller extrai e passa dados ao `CreateOrUpdatePortfolioUseCase`
3. UseCase normaliza `codigo`, valida dados e verifica se portfolio existe
4. Se existir: chama `entity.registerCompra(quantidade, precoMedio)` e salva
5. Se não existir: cria novo registro via repositório
6. Controller retorna 200 (atualização) ou 201 (criação)

**FA01 — Dados inválidos:**
1. Controller retorna 400 com mensagem de erro

---

### UC02: Importar Proventos via Planilha

**Ator:** Usuário via API (multipart/form-data)

**Pré-Condições:**
- Arquivo de planilha enviado no request

**Fluxo Principal:**
1. `proventoRoutes` recebe `POST /import` e delega ao `ProventoController.importAsync`
2. Controller extrai buffer do arquivo e chama `SpreadsheetParserService.parseProventosAsync`
3. Service retorna linhas parseadas e transformadas
4. Controller chama `ImportProventosUseCase.executeAsync(linhas)`
5. UseCase valida cada linha, persiste em transação
6. Controller retorna relatório com total importados e erros por linha

---

### UC03: Exportar Sell Snapshots (XLSX)

**Ator:** Usuário via API

**Pré-Condições:**
- Existem registros de sell snapshots no banco

**Fluxo Principal:**
1. `orderRoutes` recebe `GET /export/sell-snapshots` e delega ao `OrderController.exportSellSnapshotsAsync`
2. Controller chama `ExportSellSnapshotsUseCase.executeAsync(filtros)`
3. UseCase consulta repositório, calcula `custoMedioTotal`, `valorVendaTotal`, `ganhos`
4. UseCase chama `ExcelExportService.generateAsync(dados)`
5. Service retorna buffer XLSX
6. Controller define headers de download e envia o buffer

---

### UC04: Consultar Dados do Fundamentus

**Ator:** Usuário via API

**Pré-Condições:**
- `codigo` válido informado na URL

**Fluxo Principal:**
1. `fundamentusRoutes` recebe `GET /:codigo` e delega ao `FundamentusController.getAsync`
2. Controller extrai `codigo` e chama `FundamentusScraperService.scrapeAsync(codigo)`
3. Service normaliza código, faz requisição HTTP ao Fundamentus, parseia HTML
4. Controller retorna dados estruturados de `FundamentusAcaoDetails`

**FA01 — Falha no scraping:**
1. Service lança erro, controller retorna 502

---

## 11. CENÁRIOS DE TESTE

### Cenário 1: Portfolio criado com sucesso (Happy Path)
**Dado** que não existe portfolio com o codigo informado
**Quando** `POST /portfolio` é chamado com codigo, quantidade e precoMedio válidos
**Então** um novo portfolio é criado e retornado com status 201

### Cenário 2: Portfolio atualizado com cálculo de preço médio
**Dado** que existe portfolio com codigo "PETR4", quantidade 100, precoMedio 30.00
**Quando** `POST /portfolio` é chamado com codigo "PETR4", quantidade 50, precoMedio 36.00
**Então** o portfolio é atualizado com quantidade 150 e precoMedio calculado corretamente (32.00)
**E** o cálculo ocorre via `PortfolioEntity.registerCompra`, não no controller ou rota

### Cenário 3: Importação de proventos com linha inválida
**Dado** que a planilha possui 10 linhas sendo 1 com campo obrigatório faltando
**Quando** `POST /provento/import` é chamado com a planilha
**Então** 9 proventos são importados com sucesso
**E** o retorno inclui relatório indicando a linha com erro

### Cenário 4: Exportação de sell snapshots gera XLSX
**Dado** que existem registros de sell snapshots no banco
**Quando** `GET /orders/export/sell-snapshots` é chamado
**Então** a resposta é um arquivo XLSX com as colunas corretas
**E** os cálculos de custoMedioTotal, valorVendaTotal e ganhos estão corretos

### Cenário 5: Consulta Fundamentus para ticker válido
**Dado** que o código "PETR4" é informado
**Quando** `GET /fundamentus/PETR4` é chamado
**Então** os dados do Fundamentus são retornados com os indicadores parseados corretamente

### Cenário 6: Controller de portfolio não acessa modelo diretamente
**Dado** qualquer operação no módulo de portfolio
**Quando** o controller é executado
**Então** nenhuma importação de `Portfolio` (model Sequelize) existe no arquivo do controller

---

## 12. DEFINIÇÃO DE PRONTO

- [ ] Código implementado seguindo padrões do time
- [ ] Nenhum controller ou rota contém lógica de negócio, cálculos ou acesso direto a modelos
- [ ] Todos os módulos seguem o fluxo: Rota → Controller → UseCase → Repository
- [ ] Todos os use cases novos registrados no `service-registration.ts`
- [ ] Comportamento externo dos endpoints preservado (mesmos payloads e status codes)
- [ ] Código revisado (code review)
- [ ] Build funcionando: `npm run build` (ou equivalente)

**Se feature inclui front-end:** N/A — refatoração exclusivamente no backend

---

## 13. REFERÊNCIAS

**Código analisado:**
- `back/src/controllers/OrderController.ts`
- `back/src/controllers/ImportController.ts`
- `back/src/routes/portfolioRoutes.ts`
- `back/src/routes/proventoRoutes.ts`
- `back/src/routes/fundamentusRoutes.ts`
- `back/src/domain/entities/PortfolioEntity.ts`
- `back/src/application/use-cases/CreateOrderUseCase.ts`

---

## 14. OBSERVAÇÕES

**Ponto de atenção — Portfolio parcialmente implementado:**
A camada de domínio e repositório do portfolio já estão corretos (`PortfolioEntity` com `registerCompra`/`registerVenda`, `SequelizePortfolioRepository`). A refatoração precisa apenas completar a camada de aplicação (use cases) e o controller, sem alterar o que já foi implementado.

**Ponto de atenção — Fundamentus é web scraping:**
O `FundamentusScraperService` fará scraping de HTML de serviço externo. O comportamento atual deve ser preservado integralmente; apenas o local do código muda (da rota para o serviço).

**Ponto de atenção — ImportController usa multer fora do DI:**
O `ImportController` atualmente instancia repositórios manualmente (fora do Container). Após a refatoração, o multer continua como middleware de rota, mas o controller deve receber suas dependências via DI.

**Riscos Identificados:**
- ⚠️ `proventoRoutes.ts` possui lógica de agrupamento complexa (~60 linhas). Extrair para `ListProventosUseCase` deve preservar exatamente a mesma semântica de agregação
- ⚠️ `ImportController` tem instanciação manual fora do DI — a correção exige ajuste cuidadoso no `service-registration.ts`
- ⚠️ `OrderController.exportSellSnapshotsAsync` contém condicional `if (ganhos === 0)` que representa regra de negócio implícita — deve ser preservada no `ExportSellSnapshotsUseCase`

**Dependências:**
- 🔗 Nenhuma dependência de outras features
- 🔗 Sem necessidade de migrations de banco de dados

---

## 15. HISTÓRICO DE ALTERAÇÕES

| Data | Versão | Autor | Descrição |
|------|--------|-------|-----------|
| 2026-04-28 | 1 | IA (Claude) | Versão inicial |

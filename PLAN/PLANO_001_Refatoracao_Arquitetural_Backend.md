# Plano de Execução: Refatoração Arquitetural Backend

## Informações
- **PRD Relacionado**: PRD/001_TBD_Refatoracao_Arquitetural_Backend.md
- **Repositório**: acoes/back
- **Última atualização**: 2026-04-28

---

## 📊 PROGRESSO GERAL

**Status**: 🟡 Em Progresso
**Progresso**: 5/11 etapas concluídas (45%)
**Última Atualização**: 2026-04-28

---

[🟢🟢🟢🟢🟢⚪⚪⚪⚪⚪⚪] 45% (5/11 etapas concluídas)

> **IMPORTANTE**: Este progresso será atualizado automaticamente pela IA durante a implementação (skill `/implementar`).

---

## 📋 VISÃO GERAL

Refatoração arquitetural completa do backend (`acoes/back`) para aplicar SRP, OCP, DIP, SOLID e Clean Architecture em todos os módulos. Hoje, cinco módulos (order, import, portfolio, provento, fundamentus) possuem lógica de negócio, cálculos financeiros, parsing de dados e acesso direto a modelos Sequelize espalhados em controllers e arquivos de rota. O objetivo é que cada camada tenha responsabilidade única: rotas apenas roteiam, controllers apenas orquestram a requisição, use cases contêm as regras de negócio, e repositórios acessam dados.

A refatoração **não altera o comportamento externo** de nenhum endpoint — mesmos payloads de request/response, mesmos status codes. Nenhuma migration de banco é necessária.

O módulo portfolio já possui domain e repositório corretos; falta apenas a camada de aplicação (use cases) e o controller. Os módulos de provento e fundamentus precisam da estrutura completa. O módulo order tem seus use cases principais, mas o controller e o ImportController ainda carregam lógica indevida.

---

## 🎯 OBJETIVOS

- [ ] Módulo Portfolio: camada de aplicação completa (use cases + controller)
- [ ] Módulo Provento: estrutura completa (entity + repositório + use cases + controller)
- [ ] Módulo Fundamentus: FundamentusScraperService + controller
- [ ] Módulo Order: GetSellSnapshotsUseCase + ExportSellSnapshotsUseCase + ExcelExportService
- [ ] Módulo Import: SpreadsheetParserService + limpeza do ImportController + DI corrigido
- [ ] Todos os use cases novos registrados no Container de DI
- [ ] Nenhum controller ou rota com lógica de negócio, cálculos ou acesso direto a modelos

---

## 🗺️ MAPA DE COMPONENTES IDENTIFICADOS

### Domínio (domain/)
- `back/src/domain/interfaces/IPortfolioRepository.ts` — MODIFICAR: adicionar `findAllAsync`, `findByIdAsync`
- `back/src/domain/entities/ProventoEntity.ts` — CRIAR
- `back/src/domain/interfaces/IProventoFilters.ts` — CRIAR
- `back/src/domain/interfaces/IProventoRepository.ts` — CRIAR

### Aplicação (application/)
- `back/src/application/dto/CreateOrUpdatePortfolioDto.ts` — CRIAR
- `back/src/application/use-cases/CreateOrUpdatePortfolioUseCase.ts` — CRIAR
- `back/src/application/use-cases/DeletePortfolioUseCase.ts` — CRIAR
- `back/src/application/use-cases/ListPortfolioUseCase.ts` — CRIAR
- `back/src/application/dto/CreateProventoDto.ts` — CRIAR
- `back/src/application/use-cases/CreateProventoUseCase.ts` — CRIAR
- `back/src/application/use-cases/DeleteProventoUseCase.ts` — CRIAR
- `back/src/application/use-cases/ImportProventosUseCase.ts` — CRIAR
- `back/src/application/use-cases/ListProventosUseCase.ts` — CRIAR
- `back/src/application/use-cases/GetSellSnapshotsUseCase.ts` — CRIAR
- `back/src/application/use-cases/ExportSellSnapshotsUseCase.ts` — CRIAR

### Infraestrutura (infrastructure/)
- `back/src/infrastructure/repositories/SequelizePortfolioRepository.ts` — MODIFICAR: implementar métodos novos
- `back/src/infrastructure/repositories/SequelizeProventoRepository.ts` — CRIAR
- `back/src/infrastructure/services/FundamentusScraperService.ts` — CRIAR
- `back/src/infrastructure/services/ExcelExportService.ts` — CRIAR
- `back/src/infrastructure/services/SpreadsheetParserService.ts` — CRIAR

### Controllers (controllers/)
- `back/src/controllers/PortfolioController.ts` — CRIAR
- `back/src/controllers/ProventoController.ts` — CRIAR
- `back/src/controllers/FundamentusController.ts` — CRIAR
- `back/src/controllers/OrderController.ts` — MODIFICAR: remover acesso direto ao repositório e lógica de exportação
- `back/src/controllers/ImportController.ts` — MODIFICAR: usar DI e SpreadsheetParserService

### Rotas (routes/)
- `back/src/routes/portfolioRoutes.ts` — MODIFICAR: delegar ao PortfolioController
- `back/src/routes/proventoRoutes.ts` — MODIFICAR: delegar ao ProventoController
- `back/src/routes/fundamentusRoutes.ts` — MODIFICAR: delegar ao FundamentusController

### DI
- `back/src/shared/dependency-injection/service-registration.ts` — MODIFICAR: registrar todos os novos use cases e serviços

---

## 🧪 ESTRATÉGIA DE TESTES

*(Testes unitários fora do escopo desta feature conforme acordo com o desenvolvedor)*

### Testes Manuais
- [ ] `POST /portfolios` cria novo portfolio (status 201)
- [ ] `POST /portfolios` com codigo já existente atualiza preço médio corretamente
- [ ] `DELETE /portfolios/:id` com id inexistente retorna 404
- [ ] `GET /portfolios` retorna lista ordenada por createdAt DESC
- [ ] `POST /proventos` cria provento válido (status 201)
- [ ] `POST /proventos/import` importa planilha e retorna relatório
- [ ] `GET /proventos?agruparPorCodigo=true` retorna agrupado por codigo+tipo
- [ ] `DELETE /proventos/:id` deleta provento
- [ ] `GET /fundamentus/PETR4` retorna indicadores parseados
- [ ] `GET /orders/export/sell-snapshots` retorna arquivo XLSX
- [ ] `GET /orders/export/sell-snapshots/data` retorna dados JSON
- [ ] `POST /orders/import` importa planilha de ordens
- [ ] Aplicação inicializa sem erros (`npm run dev`)

---

## ⚙️ ETAPAS DE IMPLEMENTAÇÃO

---

### ✅ ETAPA 1: Ampliar IPortfolioRepository e SequelizePortfolioRepository

**Status:** ✅ Concluída
**Data de Conclusão:** 2026-04-28

**Objetivo:**
Adicionar os métodos `findAllAsync` e `findByIdAsync` à interface `IPortfolioRepository` e implementá-los no `SequelizePortfolioRepository`, pois o `ListPortfolioUseCase` e o `DeletePortfolioUseCase` precisarão deles.

**Complexidade:** Baixa
**Tempo Estimado:** 20 minutos

**Arquivo(s) Afetado(s):**
- `back/src/domain/interfaces/IPortfolioRepository.ts` (modificar)
- `back/src/infrastructure/repositories/SequelizePortfolioRepository.ts` (modificar)

**Mudanças Técnicas:**
```
IPortfolioRepository — adicionar:
+ findAllAsync(tx?: unknown): Promise<PortfolioEntity[]>
+ findByIdAsync(id: string, tx?: unknown): Promise<PortfolioEntity | null>

SequelizePortfolioRepository — implementar:
+ findAllAsync: Portfolio.findAll({ order: [["createdAt", "DESC"]], transaction })
+ findByIdAsync: Portfolio.findByPk(id, { transaction })
```

**Critérios de Aceitação:**
- [ ] Interface atualizada com os dois métodos novos
- [ ] Repositório implementa ambos os métodos
- [ ] Padrão de retorno `PortfolioEntity` via `toEntity()` (já existente no repositório)

**Dependências:** Nenhuma

---

### ✅ ETAPA 2: Criar camada de aplicação do Portfolio (DTOs e Use Cases)

**Status:** ✅ Concluída
**Data de Conclusão:** 2026-04-28

**Objetivo:**
Criar os 3 use cases do módulo portfolio e o DTO correspondente, seguindo o mesmo padrão de `CreateOrderUseCase` (construtor com interfaces, método `executeAsync`, sem acesso direto a modelos).

**Complexidade:** Média
**Tempo Estimado:** 45 minutos

**Arquivo(s) Afetado(s):**
- `back/src/application/dto/CreateOrUpdatePortfolioDto.ts` (criar)
- `back/src/application/use-cases/CreateOrUpdatePortfolioUseCase.ts` (criar)
- `back/src/application/use-cases/DeletePortfolioUseCase.ts` (criar)
- `back/src/application/use-cases/ListPortfolioUseCase.ts` (criar)

**Mudanças Técnicas:**

`CreateOrUpdatePortfolioDto`:
```
interface CreateOrUpdatePortfolioDto {
  codigo: string
  quantidade: number
  precoMedio: number
}
```

`CreateOrUpdatePortfolioUseCase`:
```
constructor(private portfolioRepository: IPortfolioRepository)
executeAsync(dto: CreateOrUpdatePortfolioDto): Promise<PortfolioEntity>
  - Normaliza codigo via normalizeOrderCodigo
  - Valida: codigo, quantidade > 0, precoMedio >= 0, isSupportedB3Ticker
  - Busca portfolio por codigo
  - Se existir: entity.registerCompra(quantidade, precoMedio) + repositório.saveAsync
  - Se não existir: repositório.createAsync
  - Retorna PortfolioEntity
```

`DeletePortfolioUseCase`:
```
constructor(private portfolioRepository: IPortfolioRepository)
executeAsync(id: string): Promise<void>
  - Busca por id via findByIdAsync
  - Se não existir: throw Error("Ativo do portfólio não encontrado.")
  - deleteByCodigoAsync(entity.codigo)
```

`ListPortfolioUseCase`:
```
constructor(private portfolioRepository: IPortfolioRepository)
executeAsync(): Promise<PortfolioEntity[]>
  - Retorna portfolioRepository.findAllAsync()
```

**Critérios de Aceitação:**
- [ ] Todos os use cases seguem o padrão: construtor com interfaces, `executeAsync`, sem import de modelos Sequelize
- [ ] `CreateOrUpdatePortfolioUseCase` usa `entity.registerCompra` ao atualizar (não calcula preço médio manualmente)
- [ ] `DeletePortfolioUseCase` lança erro com mensagem exata quando não encontrar

**Dependências:** ETAPA 1

---

### ✅ ETAPA 3: Criar PortfolioController, atualizar portfolioRoutes e registrar DI

**Status:** ✅ Concluída
**Data de Conclusão:** 2026-04-28

**Objetivo:**
Criar o `PortfolioController` que delega para os use cases (sem nenhuma lógica), atualizar `portfolioRoutes.ts` para usar o controller (mesmo padrão de lazy init de `orderRoutes.ts`) e registrar os novos use cases no Container.

**Complexidade:** Baixa
**Tempo Estimado:** 30 minutos

**Arquivo(s) Afetado(s):**
- `back/src/controllers/PortfolioController.ts` (criar)
- `back/src/routes/portfolioRoutes.ts` (modificar — substituir toda lógica inline)
- `back/src/shared/dependency-injection/service-registration.ts` (modificar)

**Mudanças Técnicas:**

`PortfolioController`:
```
constructor() — obtém use cases via Container.get()
  createOrUpdateAsync(req, res): Promise<Response>
    - Extrai body, chama CreateOrUpdatePortfolioUseCase, retorna 201 (criado) ou 200 (atualizado)
    - ErrorHandler.handle para erros
  deleteAsync(req, res): Promise<Response>
    - Extrai id de params, chama DeletePortfolioUseCase
    - ErrorHandler.handle para erros
  listAsync(req, res): Promise<Response>
    - Chama ListPortfolioUseCase, retorna JSON
    - ErrorHandler.handle para erros
```

`portfolioRoutes.ts` — substituir lógica inline pelo padrão de `orderRoutes.ts`:
```typescript
portfolioRoutes.post("/", (req, res) => {
  const controller = new PortfolioController();
  return controller.createOrUpdateAsync(req, res);
});
// idem para GET e DELETE
```

`service-registration.ts` — adicionar:
```
Container.register('createOrUpdatePortfolioUseCase', ...)
Container.register('deletePortfolioUseCase', ...)
Container.register('listPortfolioUseCase', ...)
```

**Critérios de Aceitação:**
- [ ] `portfolioRoutes.ts` sem nenhuma lógica de negócio — apenas roteamento
- [ ] `PortfolioController` sem import de `Portfolio` (model Sequelize)
- [ ] Use cases registrados no Container
- [ ] Endpoints `POST /portfolios`, `GET /portfolios`, `DELETE /portfolios/:id` funcionam igual ao comportamento atual

**Dependências:** ETAPA 2

---

### ✅ ETAPA 4: Criar domínio do Provento (ProventoEntity, IProventoFilters, IProventoRepository)

**Status:** ✅ Concluída
**Data de Conclusão:** 2026-04-28

**Objetivo:**
Criar a camada de domínio do módulo provento: entidade de domínio, interface de filtros e interface do repositório. A `ProventoEntity` deve refletir os campos do modelo `Provento` (id, codigo, data, tipo, instituicao, quantidade, precoUnitario, valorLiquido). O `ProventoTipo` já existe em `models/ProventoTipo.ts` e deve ser importado de lá.

**Complexidade:** Baixa
**Tempo Estimado:** 25 minutos

**Arquivo(s) Afetado(s):**
- `back/src/domain/entities/ProventoEntity.ts` (criar)
- `back/src/domain/interfaces/IProventoFilters.ts` (criar)
- `back/src/domain/interfaces/IProventoRepository.ts` (criar)

**Mudanças Técnicas:**

`ProventoEntity`:
```
class ProventoEntity {
  constructor(
    id: string,
    codigo: string,
    data: string,         // formato BR (DD-MM-YYYY)
    tipo: ProventoTipo,
    instituicao: string,
    quantidade: number,
    precoUnitario: number,
    valorLiquido: number,
    createdAt?: Date,
    updatedAt?: Date
  )
}
```

`IProventoFilters`:
```
interface IProventoFilters {
  codigo?: string
  tipo?: string
  dataInicial?: string   // ISO (YYYY-MM-DD)
  dataFinal?: string     // ISO (YYYY-MM-DD)
  data?: string          // ISO (YYYY-MM-DD) — filtro de data exata
  agruparPorCodigo?: boolean
  page?: number
  limit?: number
}
```

`IProventoRepository`:
```
interface IProventoRepository {
  createAsync(provento: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">, tx?): Promise<ProventoEntity>
  createManyAsync(proventos: Omit<...>[], tx?): Promise<ProventoEntity[]>
  findByIdAsync(id: string, tx?): Promise<ProventoEntity | null>
  findAllAsync(filters: IProventoFilters): Promise<{ rows: ProventoEntity[]; count: number }>
  deleteAsync(id: string, tx?): Promise<void>
}
```

**Critérios de Aceitação:**
- [ ] `ProventoEntity` sem lógica de negócio (apenas campos + construtor)
- [ ] `IProventoRepository` usa apenas `ProventoEntity` e interfaces, sem imports de Sequelize
- [ ] `IProventoFilters` reflete todos os parâmetros de query da rota atual

**Dependências:** Nenhuma

---

### ✅ ETAPA 5: Criar SequelizeProventoRepository

**Status:** ✅ Concluída
**Data de Conclusão:** 2026-04-28

**Objetivo:**
Implementar `SequelizeProventoRepository` seguindo o padrão dos outros repositórios do projeto (mesmo estilo de `SequelizePortfolioRepository`). O método `findAllAsync` deve implementar toda a lógica de filtros, agrupamento e paginação que hoje está em `proventoRoutes.ts`.

**Complexidade:** Alta
**Tempo Estimado:** 60 minutos

**Arquivo(s) Afetado(s):**
- `back/src/infrastructure/repositories/SequelizeProventoRepository.ts` (criar)

**Mudanças Técnicas:**

```
SequelizeProventoRepository implements IProventoRepository
  createAsync: Provento.create(data, { transaction }) → toEntity()
  
  createManyAsync: loop de Provento.create para cada item com a mesma transaction
  
  findByIdAsync: Provento.findByPk(id, { transaction }) → toEntity() ou null
  
  deleteAsync: Provento.destroy({ where: { id }, transaction })
  
  findAllAsync(filters):
    1. Monta cláusula WHERE (codigo like, tipo =, date range usando buildBrDateOrderExpression)
    2. Se agruparPorCodigo = true:
       - Busca todas as linhas sem limit/offset
       - Agrupa em Map<`${codigo}::${tipo}`, ...> somando quantidade e valorLiquido, calculando precoUnitario médio
       - Aplica paginação sobre grupos resultantes
       - Retorna { rows: grupos[], count: totalGrupos }
    3. Se não agrupar:
       - Provento.findAndCountAll({ where, order, limit, offset })
       - Retorna { rows: rows.map(toEntity), count }
  
  private toEntity(model): ProventoEntity
```

**Critérios de Aceitação:**
- [ ] Lógica de agrupamento preserva a semântica exata atual (agrupa por `codigo::tipo`, soma `quantidade` e `valorLiquido`, calcula `precoUnitario = valorLiquido / quantidade`)
- [ ] Lógica de filtro de datas usa `buildBrDateOrderExpression` (já usado no projeto)
- [ ] Paginação correta: offset = (page - 1) * limit
- [ ] `toEntity` mapeia todos os campos do model Sequelize para `ProventoEntity`

**Dependências:** ETAPA 4

---

### ✅ ETAPA 6: Criar camada de aplicação do Provento (DTOs e Use Cases)

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Criar os use cases e DTOs do módulo provento. `ImportProventosUseCase` recebe linhas já parseadas pelo `SpreadsheetParserService` (que será criado na ETAPA 9). `ListProventosUseCase` normaliza parâmetros e delega para o repositório.

**Complexidade:** Média
**Tempo Estimado:** 50 minutos

**Arquivo(s) Afetado(s):**
- `back/src/application/dto/CreateProventoDto.ts` (criar)
- `back/src/application/use-cases/CreateProventoUseCase.ts` (criar)
- `back/src/application/use-cases/DeleteProventoUseCase.ts` (criar)
- `back/src/application/use-cases/ImportProventosUseCase.ts` (criar)
- `back/src/application/use-cases/ListProventosUseCase.ts` (criar)

**Mudanças Técnicas:**

`CreateProventoDto`:
```
interface CreateProventoDto {
  codigo: string
  data: string
  tipo: ProventoTipo
  instituicao: string
  quantidade: number
  precoUnitario: number
  valorLiquido: number
}
```

`CreateProventoUseCase`:
```
constructor(private proventoRepository: IProventoRepository)
executeAsync(dto: CreateProventoDto): Promise<ProventoEntity>
  - Normaliza codigo via normalizeOrderCodigo
  - Normaliza data via toBrDateString
  - Valida: isSupportedB3Ticker, data não nula, não futura (isFutureBrDate de utils/datas)
  - repositório.createAsync(dto normalizado)
```

`DeleteProventoUseCase`:
```
constructor(private proventoRepository: IProventoRepository)
executeAsync(id: string): Promise<void>
  - Busca por id via findByIdAsync
  - Se não existir: throw Error("Provento não encontrado.")
  - repositório.deleteAsync(id)
```

`ImportProventosUseCase`:
```
constructor(
  private proventoRepository: IProventoRepository,
  private transactionManager: ITransactionManager
)
executeAsync(linhas: CreateProventoDto[]): Promise<{ imported: number; skipped: number; invalidLines: number[] }>
  - Executa dentro de transação
  - Para cada linha: valida (codigo, data, tipo, quantidade > 0, valorLiquido >= 0, !futura)
  - Linhas inválidas: acumula número de linha em invalidLines
  - Linhas válidas: repositório.createAsync(linha, tx)
  - Se imported === 0 e há linhas inválidas: throw Error com primeira linha inválida
  - Retorna { imported, skipped, invalidLines }
```

`ListProventosUseCase`:
```
constructor(private proventoRepository: IProventoRepository)
executeAsync(filters: IProventoFilters): Promise<{ data, page, limit, total, totalPages }>
  - Normaliza datas de BR (DD-MM-YYYY) ou ISO para ISO (YYYY-MM-DD)
  - Normaliza codigo se presente
  - Chama repositório.findAllAsync(filtersNormalizados)
  - Calcula totalPages
  - Retorna objeto paginado
```

**Critérios de Aceitação:**
- [ ] Todos os use cases sem import de modelos Sequelize ou do módulo `sequelize`
- [ ] `ImportProventosUseCase` preserva comportamento de validação linha a linha da rota atual
- [ ] `ListProventosUseCase` preserva semântica de agrupamento (delega ao repositório via flag `agruparPorCodigo`)

**Dependências:** ETAPA 4, ETAPA 5

---

### ✅ ETAPA 7: Criar ProventoController, atualizar proventoRoutes e registrar DI

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Criar `ProventoController` limpo e substituir toda a lógica de `proventoRoutes.ts` por delegações ao controller. O multer middleware para upload de arquivo permanece na rota (mesma abordagem de `orderRoutes.ts` para o import de ordens).

**Complexidade:** Média
**Tempo Estimado:** 35 minutos

**Arquivo(s) Afetado(s):**
- `back/src/controllers/ProventoController.ts` (criar)
- `back/src/routes/proventoRoutes.ts` (modificar — substituir todas as ~390 linhas de lógica)
- `back/src/shared/dependency-injection/service-registration.ts` (modificar)

**Mudanças Técnicas:**

`ProventoController`:
```
constructor() — obtém use cases via Container.get()
  createAsync(req, res): extrai body, chama CreateProventoUseCase
  deleteAsync(req, res): extrai id de params, chama DeleteProventoUseCase
  importAsync(req, res): extrai buffer do arquivo, chama SpreadsheetParserService (ETAPA 9) → ImportProventosUseCase
  listAsync(req, res): extrai query params, chama ListProventosUseCase
```

`proventoRoutes.ts` — substituir toda lógica pelo padrão:
```typescript
proventoRoutes.post("/", (req, res) => {
  new ProventoController().createAsync(req, res);
});

proventoRoutes.post("/import", upload.single("file"), (req, res) => {
  new ProventoController().importAsync(req, res);
});

proventoRoutes.delete("/:id", (req, res) => {
  new ProventoController().deleteAsync(req, res);
});

proventoRoutes.get("/", (req, res) => {
  new ProventoController().listAsync(req, res);
});
```

`service-registration.ts` — adicionar:
```
Container.register('proventoRepository', ...)
Container.register('createProventoUseCase', ...)
Container.register('deleteProventoUseCase', ...)
Container.register('importProventosUseCase', ...)
Container.register('listProventosUseCase', ...)
```

**Critérios de Aceitação:**
- [ ] `proventoRoutes.ts` sem lógica de negócio, parsing, normalização ou acesso direto a modelos
- [ ] `ProventoController` sem import de `Provento` (model Sequelize) ou `sequelize`
- [ ] Comportamento de todos os endpoints preservado

**Dependências:** ETAPA 6 (use cases), ETAPA 9 (SpreadsheetParserService — pode ser temporariamente apontado após criação)

---

### ✅ ETAPA 8: Criar FundamentusScraperService, FundamentusController e atualizar fundamentusRoutes

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Extrair todo o código de scraping/parsing HTML de `fundamentusRoutes.ts` para `FundamentusScraperService`. Criar `FundamentusController` limpo. Atualizar `fundamentusRoutes.ts` para delegar ao controller. Registrar no DI.

**Complexidade:** Média
**Tempo Estimado:** 40 minutos

**Arquivo(s) Afetado(s):**
- `back/src/infrastructure/services/FundamentusScraperService.ts` (criar)
- `back/src/controllers/FundamentusController.ts` (criar)
- `back/src/routes/fundamentusRoutes.ts` (modificar — substituir ~128 linhas de lógica)
- `back/src/shared/dependency-injection/service-registration.ts` (modificar)

**Mudanças Técnicas:**

`FundamentusScraperService`:
```
Extrair de fundamentusRoutes.ts:
  - constante BASE_URL
  - decodeHtmlEntities(value): string
  - stripHtml(value): string
  - normalizeLabel(value): string
  - normalizeCodigoForFundamentus(value): string (mover para método privado)
  - parseFundamentusDetails(codigo, html): FundamentusAcaoDetails (mover para método privado)
  + scrapeAsync(codigo: string): Promise<FundamentusAcaoDetails>
    - normaliza codigo
    - faz fetch com headers corretos + TextDecoder("iso-8859-1")
    - verifica se response.ok
    - verifica "papel inexistente"
    - chama parseFundamentusDetails
    - valida que indicadores.length > 0
    - lança erros com mensagens específicas para cada falha
```

`FundamentusController`:
```
constructor() — obtém FundamentusScraperService via Container.get()
  getAsync(req, res): Promise<Response>
    - Extrai codigo de params
    - Chama scrapeAsync(codigo)
    - Retorna res.json(parsed)
    - ErrorHandler.handle para erros (mapear 404, 502, 500)
```

`fundamentusRoutes.ts` — substituir toda lógica:
```typescript
fundamentusRoutes.get("/:codigo", (req, res) => {
  new FundamentusController().getAsync(req, res);
});
```

`service-registration.ts` — adicionar:
```
Container.register('fundamentusScraper', () => new FundamentusScraperService())
Container.register('fundamentusController', ...) // ou instanciar direto na rota
```

**Critérios de Aceitação:**
- [ ] `fundamentusRoutes.ts` com apenas 3-5 linhas de código (roteamento puro)
- [ ] `FundamentusController` sem nenhuma lógica de parsing HTML
- [ ] `FundamentusScraperService` preserva exatamente o mesmo comportamento de scraping atual
- [ ] Resposta da API identica ao comportamento atual

**Dependências:** Nenhuma

---

### ✅ ETAPA 9: Criar SpreadsheetParserService

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Criar `SpreadsheetParserService` que encapsula toda lógica de extração e transformação de dados de planilhas. Terá dois métodos públicos: um para ordens (usado pelo `ImportController`) e um para proventos (usado pelo `ProventoController`). Reutiliza funções de `utils/spreadsheet.ts` já existentes.

**Complexidade:** Média
**Tempo Estimado:** 35 minutos

**Arquivo(s) Afetado(s):**
- `back/src/infrastructure/services/SpreadsheetParserService.ts` (criar)

**Mudanças Técnicas:**

```
SpreadsheetParserService
  parseOrderRowsAsync(buffer: Buffer): CreateOrderDto[]
    Extrair de ImportController.importAsync:
      - readSpreadsheetRows(buffer)
      - Para cada row:
        - extractField com nomes alternativos (Código de Negociação, etc.)
        - normalizeOrderCodigo
        - parseDecimal (quantidade e preco)
        - toBrDateString (data)
        - normalizeOperacao (Compra/Venda)
        - detectSupportedAssetTypeFromTicker (tipo)
        - Math.trunc (quantidade)
        - Validação de campos obrigatórios com throw Error("Linha X: ...")
      - Retorna CreateOrderDto[]

  parseProventoRowsAsync(buffer: Buffer): CreateProventoDto[]
    Extrair de proventoRoutes.ts (bloco POST /import):
      - readSpreadsheetRows(buffer)
      - isRowEmpty, isHeaderCell (mover como métodos privados)
      - normalizeCodigoFromProduto (mover como método privado)
      - normalizeTipoProvento (mover como método privado)
      - extractField com todos os nomes alternativos (Produto, Pagamento, etc.)
      - parseDecimal, toBrDateString, Math.trunc
      - Linhas inválidas: acumular, não lançar exceção (deixar para ImportProventosUseCase decidir)
      - Retorna { validRows: CreateProventoDto[], invalidLineNumbers: number[] }
```

**Critérios de Aceitação:**
- [ ] Toda lógica de parsing de linhas extraída para o serviço (ImportController e proventoRoutes não precisam mais de `extractField`, `parseDecimal`, `toBrDateString` direto)
- [ ] `parseProventoRowsAsync` preserva detecção de linhas de cabeçalho e linhas vazias
- [ ] Erros de linha inválida em `parseOrderRowsAsync` lançam exceção com número de linha

**Dependências:** Nenhuma

---

### ✅ ETAPA 10: Criar GetSellSnapshotsUseCase, ExcelExportService e ExportSellSnapshotsUseCase

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Extrair do `OrderController` a lógica de consulta de sell snapshots e exportação XLSX para use cases e serviço dedicado. Manter exatamente a mesma regra de negócio: `if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal`.

**Complexidade:** Média
**Tempo Estimado:** 40 minutos

**Arquivo(s) Afetado(s):**
- `back/src/application/use-cases/GetSellSnapshotsUseCase.ts` (criar)
- `back/src/infrastructure/services/ExcelExportService.ts` (criar)
- `back/src/application/use-cases/ExportSellSnapshotsUseCase.ts` (criar)

**Mudanças Técnicas:**

`GetSellSnapshotsUseCase`:
```
constructor(private sellSnapshotRepository: IOrderSellSnapshotRepository)
executeAsync(): Promise<SellSnapshotRow[]>
  - Chama sellSnapshotRepository.findAllAsync()
  - Mapeia para objeto com: codigo, precoMedioAtual, quantidade, valorAtualAcao, ganhos, data
  - Retorna array mapeado
```

`ExcelExportService`:
```
generateAsync(rows: SellSnapshotExportRow[], fileName: string): Buffer
  - Usa XLSX.utils.book_new(), json_to_sheet(rows), book_append_sheet
  - XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  - Retorna buffer
```

`ExportSellSnapshotsUseCase`:
```
constructor(
  private sellSnapshotRepository: IOrderSellSnapshotRepository,
  private excelExportService: ExcelExportService
)
executeAsync(): Promise<{ buffer: Buffer; fileName: string }>
  - Busca snapshots via repositório
  - Para cada snapshot:
    - custoMedioTotal = precoMedioAtual * quantidade
    - valorVendaTotal = valorAtualAcao * quantidade
    - ganhos = snapshot.ganhos; if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal
    - Monta objeto com colunas: Data, Ativo, "Preço Médio", "Quantidade Vendida", "Preço Venda", "Custo Médio Total", "Valor Total Venda", "Lucro/Perda"
  - fileName = DateUtils.generateFileName("vendas")
  - buffer = excelExportService.generateAsync(rows, fileName)
  - Retorna { buffer, fileName }
```

**Critérios de Aceitação:**
- [ ] Regra de negócio `if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal` está no `ExportSellSnapshotsUseCase`
- [ ] Nomes das colunas XLSX preservados exatamente (Data, Ativo, "Preço Médio", etc.)
- [ ] `ExcelExportService` sem dependência de repositório

**Dependências:** Nenhuma (usa `IOrderSellSnapshotRepository` já existente)

---

### ✅ ETAPA 11: Limpar OrderController, limpar ImportController e registrar todos os novos serviços no DI

**Status:** ⏳ Pendente
**Data de Conclusão:** -

**Objetivo:**
Refatorar `OrderController` para usar `GetSellSnapshotsUseCase` e `ExportSellSnapshotsUseCase` (removendo acesso direto ao repositório e geração de XLSX). Refatorar `ImportController` para usar o Container de DI e `SpreadsheetParserService`. Registrar todos os serviços e use cases novos criados nas etapas anteriores no `service-registration.ts`. Esta é a etapa final que fecha o ciclo.

**Complexidade:** Média
**Tempo Estimado:** 45 minutos

**Arquivo(s) Afetado(s):**
- `back/src/controllers/OrderController.ts` (modificar)
- `back/src/controllers/ImportController.ts` (modificar)
- `back/src/shared/dependency-injection/service-registration.ts` (modificar — consolidação final)

**Mudanças Técnicas:**

`OrderController` — mudanças:
```
Remover:
  - import * as XLSX from "xlsx"
  - import SequelizeOrderSellSnapshotRepository
  - private sellSnapshotRepository: SequelizeOrderSellSnapshotRepository

Adicionar:
  - private getSellSnapshotsUseCase: GetSellSnapshotsUseCase (via Container)
  - private exportSellSnapshotsUseCase: ExportSellSnapshotsUseCase (via Container)

getSellSnapshotsDataAsync — antes: acesso direto ao repositório + mapeamento
  Depois: chama getSellSnapshotsUseCase.executeAsync()

exportSellSnapshotsAsync — antes: acesso direto + cálculos + XLSX
  Depois:
    const { buffer, fileName } = await this.exportSellSnapshotsUseCase.executeAsync()
    res.setHeader("Content-Type", "application/vnd...")
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
    return res.send(buffer)
```

`ImportController` — mudanças:
```
Remover:
  - Instanciações manuais de repositories e use case no escopo de módulo
  - Lógica de parsing de linhas (extractField, parseDecimal, normalizeOperacao, etc.)

Adicionar:
  - private importOrdersUseCase: ImportOrdersUseCase (via Container.get)
  - private spreadsheetParser: SpreadsheetParserService (via Container.get)

importAsync — antes: parsing inline + importOrdersUseCase.executeAsync
  Depois:
    const ordersToImport = this.spreadsheetParser.parseOrderRowsAsync(file.buffer)
    const importedCount = await this.importOrdersUseCase.executeAsync(ordersToImport)
    return res.status(201).json({ imported: importedCount })
```

`service-registration.ts` — consolidação final, registrar tudo:
```
// Repositories novos
Container.register('proventoRepository', ...)

// Infrastructure Services
Container.register('fundamentusScraper', ...)
Container.register('excelExportService', ...)
Container.register('spreadsheetParser', ...)

// Use Cases Order
Container.register('getSellSnapshotsUseCase', ...)
Container.register('exportSellSnapshotsUseCase', ...)
Container.register('importOrdersUseCase', ...)

// Use Cases Portfolio
Container.register('createOrUpdatePortfolioUseCase', ...)
Container.register('deletePortfolioUseCase', ...)
Container.register('listPortfolioUseCase', ...)

// Use Cases Provento
Container.register('createProventoUseCase', ...)
Container.register('deleteProventoUseCase', ...)
Container.register('importProventosUseCase', ...)
Container.register('listProventosUseCase', ...)
```

**Critérios de Aceitação:**
- [ ] `OrderController` sem import de `XLSX`, sem import de `SequelizeOrderSellSnapshotRepository`
- [ ] `ImportController` sem instanciações manuais fora do Container
- [ ] `service-registration.ts` registra todos os novos use cases e serviços
- [ ] Aplicação inicializa sem erros (`npm run dev`)
- [ ] Todos os endpoints funcionam com comportamento idêntico ao estado inicial

**Dependências:** ETAPA 9 (SpreadsheetParserService), ETAPA 10 (use cases de sell snapshots)

---

## Checklist Final de Validação

### Build & Testes
- [ ] TypeScript compila sem erros
- [ ] Aplicação inicia sem erros
- [ ] Nenhum controller ou rota importa models Sequelize diretamente

### Validação de Endpoints
- [ ] `POST /portfolios` — cria novo ativo
- [ ] `POST /portfolios` — atualiza preço médio de ativo existente
- [ ] `GET /portfolios` — lista portfolios
- [ ] `DELETE /portfolios/:id` — deleta ativo
- [ ] `POST /proventos` — cria provento
- [ ] `POST /proventos/import` — importa planilha
- [ ] `GET /proventos` — lista proventos (simples e agrupado)
- [ ] `DELETE /proventos/:id` — deleta provento
- [ ] `GET /fundamentus/:codigo` — retorna dados da ação
- [ ] `POST /orders` — cria ordem
- [ ] `GET /orders` — lista ordens
- [ ] `DELETE /orders/:id` — deleta ordem
- [ ] `POST /orders/import` — importa planilha
- [ ] `GET /orders/export/sell-snapshots` — gera XLSX
- [ ] `GET /orders/export/sell-snapshots/data` — retorna dados JSON

---

## ⚠️ PONTOS DE ATENÇÃO

1. **ETAPA 3 → ETAPA 7**: A ETAPA 7 (`ProventoController.importAsync`) depende do `SpreadsheetParserService` criado na ETAPA 9. Ao implementar a ETAPA 7, o método `importAsync` pode ser deixado com `TODO` ou implementado junto com a ETAPA 9 se feitos em sequência.

2. **Agrupamento de proventos**: A lógica de agrupamento atual usa `Map<codigo::tipo, ...>` com acumulação em memória. A `SequelizeProventoRepository.findAllAsync` deve reproduzir exatamente essa semântica: busca todos os registros sem paginar, depois agrupa, depois pagina os grupos.

3. **ImportController — instanciação de módulo**: As variáveis de repositórios e use case estão no escopo do módulo (fora da classe). Ao refatorar, garantir que o `multer` middleware continue como `getMiddleware()` ou diretamente na rota.

4. **Regra de ganhos**: A regra `if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal` em `exportSellSnapshotsAsync` é implícita e não óbvia. Ela compensa o caso onde `ganhos` foi registrado como 0 em vez de calculado na venda. Deve ser preservada exatamente no `ExportSellSnapshotsUseCase`.

5. **ErrorHandler e 404 para provento**: O `ErrorHandler` atual mapeia apenas mensagens de erros de Order. Ao criar `DeleteProventoUseCase` que lança `"Provento não encontrado."`, garantir que o ErrorHandler retorne 404 para essa mensagem (similar ao tratamento de "Ordem não encontrada").

---

## 💡 DECISÕES TÉCNICAS

### Decisão 1: Agrupamento de proventos no repositório vs. use case
- **Opção escolhida**: `SequelizeProventoRepository.findAllAsync` faz o agrupamento internamente, controlado pelo flag `agruparPorCodigo` em `IProventoFilters`
- **Justificativa**: Mantém a lógica de acesso a dados coesa no repositório; o use case apenas normaliza filtros e chama o repositório
- **Alternativa considerada**: Use case faz o agrupamento em memória após buscar do repositório (mais verboso)

### Decisão 2: SpreadsheetParserService no módulo infrastructure/services
- **Opção escolhida**: `infrastructure/services/SpreadsheetParserService.ts`
- **Justificativa**: Parsers de arquivo externo são detalhes de infraestrutura; seguem o padrão de `FundamentusQuoteProvider` e `FundamentusScraperService`

### Decisão 3: multer permanece na rota
- **Opção escolhida**: Manter o middleware `multer.single("file")` diretamente nos arquivos de rota
- **Justificativa**: Multer é middleware de infraestrutura HTTP (não negócio); `orderRoutes.ts` já usa esse padrão e funciona bem

---

## 🛡️ RISCOS E MITIGAÇÕES

### Risco 1: Lógica de agrupamento de proventos com semântica diferente
- **Impacto**: Alto — resposta de `GET /proventos?agruparPorCodigo=true` seria diferente
- **Mitigação**: Seguir exatamente o algoritmo atual: Map com chave `${codigo}::${tipo}`, somar `quantidade` e `valorLiquido`, calcular `precoUnitario = valorLiquido / quantidade`, campo `data` vazio nos grupos

### Risco 2: ImportController com instanciação de módulo
- **Impacto**: Médio — pode gerar instâncias duplas se não for cuidadoso
- **Mitigação**: Na ETAPA 11, remover completamente as instanciações de módulo e usar apenas `Container.get()`

### Risco 3: ErrorHandler não cobre 404 para provento
- **Impacto**: Baixo — retornaria 500 em vez de 404
- **Mitigação**: Na ETAPA 11, verificar/atualizar `ErrorHandler` para incluir `"Provento não encontrado."` → 404

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- **PRD**: `PRD/001_TBD_Refatoracao_Arquitetural_Backend.md`
- **Container DI**: `back/src/shared/dependency-injection/Container.ts`
- **Padrão de use case**: `back/src/application/use-cases/CreateOrderUseCase.ts`
- **Padrão de repositório**: `back/src/infrastructure/repositories/SequelizePortfolioRepository.ts`
- **Padrão de controller**: `back/src/controllers/OrderController.ts` (após refatoração)
- **Padrão de rota**: `back/src/routes/orderRoutes.ts`
- **ErrorHandler**: `back/src/shared/error-handler/ErrorHandler.ts`
- **buildBrDateOrderExpression**: `back/src/database/dateExpression.ts`

---

## 🔧 COMANDOS ÚTEIS

```bash
# Verificar TypeScript
cd back && npx tsc --noEmit

# Rodar em desenvolvimento
cd back && npm run dev

# Build
cd back && npm run build
```

---

## 🔄 INSTRUÇÕES DE ATUALIZAÇÃO

Este arquivo será atualizado automaticamente pela IA durante a implementação (skill `/implementar`).

Após completar cada etapa:
1. Status muda para ✅ Concluída
2. Data de conclusão é preenchida
3. Progresso geral é atualizado (% e barra visual)

**Não edite manualmente** este arquivo durante a implementação.

---

**Plano criado em:** 2026-04-28
**Última atualização:** 2026-04-28
**Próximo passo:** `/implementar ETAPA 1`

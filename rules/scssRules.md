# Regras SCSS

Este documento define padrões e boas práticas para uso de SCSS no projeto.

## Objetivos

- Manter consistência visual
- Facilitar manutenção
- Evitar duplicação de código
- Melhorar legibilidade
- Padronizar formatação
- Não utilizar comentários

---

# Boas práticas

## Organização de arquivos

- Utilizar estrutura modular
- Separar arquivos por responsabilidade
- Evitar arquivos muito grandes

---

## Evitar repetição

- Reutilizar estilos com `@mixin`
- Utilizar `@extend` apenas quando fizer sentido
- Evitar copiar blocos de CSS

### Exemplo

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  @include flex-center;
}
```

---

## Evitar aninhamento excessivo

- Limitar aninhamento em até 3 níveis
- Evitar seletores muito específicos

### Ruim

```scss
.page {
  .content {
    .card {
      .title {
        color: red;
      }
    }
  }
}
```

### Bom

```scss
.card-title {
  color: red;
}
```

---

# Variáveis globais

## Obrigatório utilizar variáveis para:

- Cores
- Fontes

---

## Cores globais

Criar e centralizar todas as cores em:

```txt
colors.scss
```

### Exemplo

```scss
// Primary
$color-primary: #2563eb;
$color-primary-hover: #1d4ed8;

$color-white: #ffffff;
$color-black: #000000;
$color-gray-100: #f3f4f6;
$color-gray-900: #111827;

$color-success: #16a34a;
$color-warning: #ca8a04;
$color-danger: #dc2626;
```

---

## Não utilizar cores fixas

### Ruim

```scss
.button {
  background: #2563eb;
}
```

### Bom

```scss
.button {
  background: $color-primary;
}
```

---

# Formatação

## Obrigatório utilizar lint/formatação automática

Ferramentas recomendadas:

- Prettier

---

## Padrões de formatação

- Utilizar 2 espaços de indentação
- Uma propriedade por linha
- Ordem lógica de propriedades
- Espaço após `:`
- Linha em branco entre blocos

### Exemplo

```scss
.card {
  display: flex;
  flex-direction: column;

  padding: 16px;
  border-radius: 8px;

  background: $color-white;
}
```

---

# Nomeação

Utilizar rule nomenclatura

---

## Variáveis

Utilizar padrão:

- kebab-case com prefixo por contexto

### Exemplo

```scss
$color-primary
$spacing-md
$font-size-lg
```

---

# Responsividade

## Utilizar variáveis para breakpoints

### Exemplo

```scss
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
```

---

## Utilizar mixins para media queries

### Exemplo

```scss
@mixin desktop {
  @media (min-width: $breakpoint-lg) {
    @content;
  }
}
```

---

# Proibições

- Evitar usar `!important`
- Não usar IDs para estilização
- Não duplicar estilos
- Não utilizar cores hardcoded
- Não criar arquivos sem responsabilidade clara
- Não utilizar aninhamento excessivo
# Regras do Projeto

Este arquivo define as regras globais que todos os agentes de IA devem seguir durante qualquer análise, implementação, refatoração ou geração de código.

## Regras obrigatórias

- Antes de iniciar qualquer tarefa, a IA deve ler todos os arquivos da pasta `rules/`
- Todas as regras encontradas em `rules/` devem ser consideradas obrigatórias
- Nenhuma implementação pode ignorar as regras definidas nessa pasta
- A IA deve reutilizar padrões já existentes no projeto antes de criar novos
- Toda nova implementação deve manter consistência com o restante do código
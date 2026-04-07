# Prompt — Correção de Bug no Prumo

Você está trabalhando no projeto **Prumo**, um app para pequenos empreendedores registrarem movimentações financeiras por voz.

## Contexto do produto
- O usuário grava um áudio curto.
- O sistema envia e processa esse áudio.
- O sistema interpreta a fala e gera um lançamento pendente.
- O usuário revisa e confirma ou descarta.
- O produto deve ser simples, rápido e confiável.

## Princípios obrigatórios
- Corrigir com a menor mudança possível.
- Não aumentar a complexidade do sistema.
- Não mexer em partes não relacionadas sem necessidade.
- Preservar o comportamento que já está funcionando.
- Evitar reescritas amplas.
- Se a causa do bug não estiver totalmente clara, investigar antes de alterar.

## Bug
[DESCREVA O BUG]

## Comportamento atual
[DESCREVA O QUE ESTÁ ACONTECENDO]

## Comportamento esperado
[DESCREVA COMO DEVERIA FUNCIONAR]

## Contexto técnico
[COLE ERRO, STACK TRACE, LOG, PRINT, OU EXPLICAÇÃO RELEVANTE]

## Arquivos prováveis
[LISTE OS ARQUIVOS MAIS PROVÁVEIS]

## Sua tarefa
1. Investigue a causa raiz do problema.
2. Explique em poucas linhas a causa provável.
3. Liste os arquivos que precisam ser alterados.
4. Aplique a correção com a menor mudança possível.
5. Explique por que a solução resolve o problema.
6. Liste testes manuais objetivos para validar a correção.
7. Se houver risco de regressão, aponte claramente.

## Formato da resposta
Responda neste formato:

### Causa provável
[explicação curta e objetiva]

### Arquivos alterados
- [arquivo]&#58; [motivo]
- [arquivo]&#58; [motivo]

### Correção aplicada
[resumo curto]

### Riscos de regressão
- [item]
- [item]

### Testes manuais
1. [teste]
2. [teste]
3. [teste]

## Regra final
Não entregue uma “solução bonita”. Entregue a solução mais segura, clara e pequena que resolva o bug.
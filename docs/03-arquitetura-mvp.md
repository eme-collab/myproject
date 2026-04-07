# Prumo — Arquitetura do MVP

## Objetivo deste documento
Este arquivo registra, de forma prática, a arquitetura atual e a lógica técnica do MVP do Prumo. O objetivo não é documentar tudo em nível acadêmico, mas manter clareza suficiente para evoluir o produto sem bagunça.

---

## 1. Stack principal
O MVP do Prumo foi construído com:

- **Next.js**
- **Supabase**
- **Vercel**

### Papéis de cada camada

#### Next.js
Responsável por:
- interface do usuário;
- rotas da aplicação;
- lógica de front-end;
- ações de servidor e/ou APIs do app;
- integração do fluxo entre captura, processamento e revisão.

#### Supabase
Responsável por:
- autenticação;
- banco de dados;
- storage dos áudios;
- persistência dos lançamentos e seus estados.

#### Vercel
Responsável por:
- deploy;
- hospedagem;
- ambiente online do MVP.

---

## 2. Visão geral do fluxo técnico
O fluxo macro do MVP é:

1. usuário faz login;
2. usuário grava um áudio;
3. o áudio é enviado ao storage;
4. o sistema processa o conteúdo;
5. o sistema transcreve/interpreta;
6. gera um lançamento pendente;
7. o usuário revisa;
8. o usuário confirma ou descarta;
9. o histórico e o resumo passam a refletir os confirmados.

---

## 3. Fluxo funcional principal

### 3.1 Login
O usuário acessa o sistema e autentica.

Objetivo:
- garantir acesso individual;
- associar gravações e lançamentos ao usuário correto.

### 3.2 Gravação do áudio
A tela principal do app deve privilegiar a gravação por voz.

Características:
- gravação curta;
- interação simples;
- botão claro de iniciar/parar;
- feedback visual suficiente para o usuário saber o que está acontecendo.

### 3.3 Upload do áudio
Após a gravação:
- o arquivo é enviado;
- o sistema registra o item para processamento.

### 3.4 Processamento
O áudio passa por:
- transcrição;
- interpretação do conteúdo financeiro.

### 3.5 Geração do pendente
A interpretação vira um lançamento pendente para revisão.

### 3.6 Revisão
O usuário vê o que o sistema entendeu e decide:
- confirmar;
- ajustar, quando aplicável;
- descartar.

### 3.7 Persistência final
Após confirmação:
- o lançamento passa a compor os dados confirmados;
- o histórico e o resumo refletem esse resultado.

---

## 4. Componentes conceituais do sistema

## 4.1 Camada de interface
Responsável por:
- login;
- gravação;
- mensagens de status;
- revisão;
- histórico;
- resumo financeiro.

### Princípio da interface
A UI deve servir ao fluxo de baixa fricção. O app não deve parecer um sistema pesado ou burocrático.

---

## 4.2 Camada de aplicação
Responsável por:
- orquestrar envio de áudio;
- acionar processamento;
- tratar erros;
- mover o usuário entre estados do fluxo.

Essa camada conecta interface, storage, interpretação e persistência.

---

## 4.3 Camada de persistência
Responsável por armazenar:
- usuários;
- áudios;
- lançamentos;
- estados dos lançamentos;
- datas e metadados relevantes.

---

## 4.4 Camada de interpretação
Responsável por transformar o conteúdo falado em estrutura financeira utilizável.

Exemplos do que precisa produzir:
- tipo do lançamento;
- valor;
- descrição;
- vencimento, quando houver;
- informação de recebido/pago ou pendente.

Essa camada é útil, mas não é tratada como infalível. Por isso existe revisão humana.

---

## 5. Entidades principais do MVP
Conceitualmente, o sistema lida com estas entidades principais:

### 5.1 Usuário
Pessoa autenticada que usa o app.

### 5.2 Áudio
Arquivo gravado pelo usuário e enviado para processamento.

### 5.3 Lançamento
Representação estruturada de um fato financeiro.

### 5.4 Status do lançamento
Estado atual do item:
- pendente;
- confirmado;
- descartado.

---

## 6. Estados importantes do fluxo
Para evitar inconsistência, o fluxo deve ser pensado em estados.

### Estados principais do áudio/lote
- gravando;
- enviado;
- processando;
- interpretado;
- disponível para revisão;
- concluído.

### Estados principais do lançamento
- pendente;
- confirmado;
- descartado.

---

## 7. Tratamento de erro
Como o Prumo depende de etapas encadeadas, o tratamento de erro precisa ser pragmático.

### Erros que merecem atenção
- falha de gravação;
- falha de upload;
- falha de storage;
- falha de transcrição;
- falha de interpretação;
- inconsistência entre áudio e lançamento gerado.

### Diretriz
O sistema deve:
- falhar de forma clara;
- evitar travar o usuário;
- preservar o máximo possível de contexto;
- permitir seguir o fluxo com revisão ou descarte quando fizer sentido.

---

## 8. Restrições arquiteturais do MVP
Para manter o MVP controlado, a arquitetura deve evitar:
- complexidade desnecessária;
- múltiplos fluxos paralelos sem necessidade;
- abstrações excessivas;
- regras genéricas demais para um escopo ainda pequeno.

A regra é: resolver bem o essencial antes de sofisticar a estrutura.

---

## 9. Diretrizes para evolução técnica
Ao evoluir o Prumo:

### Fazer
- mudanças pequenas;
- commits pequenos;
- refatorações localizadas;
- melhorias guiadas por comportamento real do usuário.

### Evitar
- reescrever módulos inteiros sem necessidade;
- expandir o domínio antes da hora;
- criar camadas complexas demais para um MVP em refinamento.

---

## 10. Critério técnico de qualidade
Uma mudança técnica no Prumo é boa quando:

- simplifica o fluxo;
- não quebra o comportamento validado;
- mantém clareza para manutenção futura;
- reduz risco de regressão;
- melhora a confiabilidade do app no uso real.

---

## 11. Resumo operacional da arquitetura
Em termos práticos, o Prumo é um pipeline simples:

**voz → upload → interpretação → revisão → confirmação → histórico/resumo**

Toda decisão técnica deve proteger esse pipeline.
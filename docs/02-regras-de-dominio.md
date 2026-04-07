# Prumo — Regras de Domínio

## Objetivo deste documento
Este arquivo registra as regras de negócio do MVP do Prumo para manter consistência no produto e evitar decisões arbitrárias durante o desenvolvimento.

---

## 1. Conceito central do domínio
O Prumo recebe uma fala curta do usuário e tenta converter essa fala em um lançamento financeiro revisável.

O sistema não deve assumir que a interpretação está sempre correta. Por isso, toda interpretação relevante passa por revisão humana antes da confirmação final.

---

## 2. Tipos de lançamento do MVP
O MVP trabalha com apenas 4 tipos principais de lançamento:

1. **Venda recebida**
2. **Venda a receber**
3. **Despesa paga**
4. **Despesa a pagar**

Esses 4 tipos são a base funcional do MVP e devem continuar sendo tratados como prioridade.

---

## 3. Definições dos tipos

### 3.1 Venda recebida
Deve ser usada quando o usuário informa uma entrada de dinheiro já recebida no momento do registro.

Exemplos:
- “Recebi 250 reais de um cliente.”
- “Fiz uma instalação e o cliente pagou 300 à vista.”

### 3.2 Venda a receber
Deve ser usada quando o usuário informa uma venda realizada, mas cujo valor ainda será recebido total ou parcialmente no futuro.

Exemplos:
- “Fechei um serviço de 500 reais e ele vai me pagar semana que vem.”
- “Recebi 200 agora e o restante ficou para 15 dias.”

### 3.3 Despesa paga
Deve ser usada quando o usuário informa um gasto que já foi pago.

Exemplos:
- “Paguei a internet hoje.”
- “Comprei material e já paguei 90 reais.”

### 3.4 Despesa a pagar
Deve ser usada quando o usuário informa uma obrigação futura ainda não paga.

Exemplos:
- “Tenho uma conta de energia para pagar amanhã.”
- “Vou pagar o fornecedor na sexta.”

---

## 4. Regra geral de interpretação
A IA deve extrair da fala, quando possível:

- tipo do lançamento;
- valor;
- descrição;
- nome de cliente ou fornecedor, se houver;
- data do evento, se houver;
- prazo ou vencimento, se houver;
- status implícito de pago/recebido ou pendente.

Quando alguma informação não existir na fala, o sistema não deve inventar detalhes desnecessários.

---

## 5. Regra de revisão obrigatória
Todo lançamento gerado a partir do áudio deve passar por revisão antes de entrar como confirmado.

A revisão existe porque:
- a fala pode ser ambígua;
- o áudio pode falhar;
- a transcrição pode errar;
- a interpretação pode ficar incompleta.

---

## 6. Estados principais do lançamento
Os lançamentos devem respeitar estes estados principais:

### 6.1 Pendente
O lançamento foi interpretado, mas ainda aguarda ação do usuário.

### 6.2 Confirmado
O usuário revisou e aceitou o lançamento.

### 6.3 Descartado
O usuário decidiu que o lançamento não deve ser mantido.

---

## 7. Regras da fila de pendentes
Quando existir mais de um lançamento pendente, o usuário deve conseguir revisar os pendentes em sequência, sem fricção desnecessária.

### Regras:
- após confirmar um pendente, o sistema deve levar o usuário ao próximo pendente, se existir;
- após descartar um pendente, o sistema deve levar o usuário ao próximo pendente, se existir;
- se não existir próximo pendente, o sistema deve encerrar o fluxo de revisão e voltar ao painel ou área equivalente com uma notificação clara.

---

## 8. Regra de descarte
O usuário deve poder descartar um lançamento pendente mesmo que:
- a transcrição esteja ruim;
- a interpretação tenha falhado;
- o áudio não tenha sido convertido em informação útil.

O descarte precisa ser simples e seguro.

---

## 9. Regra para transcrição vazia ou falha de interpretação
Se o áudio existir, mas a transcrição ou interpretação falhar:

- o sistema não deve bloquear o fluxo;
- o usuário deve ter contexto suficiente para decidir;
- o áudio original, quando disponível, pode ser usado como apoio para revisão;
- o lançamento pode ser descartado;
- o sistema pode permitir preenchimento manual quando isso fizer sentido.

---

## 10. Entrada manual
A entrada manual existe como apoio e não como protagonista do produto.

### Regras:
- a experiência principal continua sendo voz;
- a entrada manual deve seguir lógica próxima da revisão;
- quando salva diretamente pelo usuário, pode entrar como confirmada;
- a interface manual não deve ser mais complexa do que a revisão do pendente.

---

## 11. Regras do resumo financeiro
O resumo financeiro do MVP deve ser simples, útil e direto.

### Deve mostrar, por período selecionado:
- total de entradas confirmadas;
- total de despesas confirmadas;
- total a receber;
- total a pagar;
- saldo confirmado do período.

### Regras:
- considerar apenas lançamentos confirmados para totais realizados;
- lançamentos a receber e a pagar devem aparecer como pendências futuras;
- o resumo deve priorizar entendimento rápido.

---

## 12. Regras de UX do domínio
Toda decisão funcional deve respeitar estes critérios:

### 12.1 Menos digitação
Sempre que possível, a solução deve reduzir a necessidade de escrever.

### 12.2 Menos campos
Não criar campos que não sejam realmente necessários no MVP.

### 12.3 Menos distração
O foco da interface deve ser capturar, revisar e confirmar.

### 12.4 Mais confiança
O usuário precisa sentir que pode revisar antes de assumir o registro como correto.

---

## 13. Regras de escopo
Para proteger o MVP, não expandir sem necessidade para:
- categorias complexas;
- relatórios avançados;
- múltiplos módulos de gestão;
- integrações bancárias;
- automações sofisticadas;
- parametrizações excessivas.

---

## 14. Regra-mãe do domínio
Se houver dúvida entre uma solução mais sofisticada e uma solução mais simples, a solução mais simples deve vencer, desde que preserve utilidade real para o pequeno empreendedor.
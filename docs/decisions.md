# Decisões Técnicas

## ADR-001: JWT em vez de Session

**Contexto**: API stateless para suportar PWA e futuramente React Native.

**Decisão**: Usar JWT com tymon/jwt-auth.

**Consequências**:
- Token no localStorage/AsyncStorage
- Refresh token para renovação
- Logout = invalidar token no client (blacklist opcional no backend)

---

## ADR-002: PWA antes de React Native

**Contexto**: Time e complexidade de manutenção.

**Decisão**: Começar com PWA (React + Vite + Workbox). Mobile nativo depois.

**Consequências**:
- Um app web responsivo
- Instalável no celular
- Funciona offline (fase 2)
- Menos código para manter inicialmente

---

## ADR-003: Foto opcional vs obrigatória

**Contexto**: Evitar "marquei sem fazer" em tarefas críticas.

**Decisão**: Campo `requires_photo` na tabela `tasks`. Tarefas críticas = true.

**Consequências**:
- Flexibilidade por tarefa
- UX mais simples para tarefas não críticas
- Gerente define quais tarefas exigem foto

---

## ADR-004: Sem soft delete em task_logs

**Contexto**: Auditoria e compliance.

**Decisão**: TaskLog nunca deletado. Correções com `corrected_at`, `correction_reason`, `corrected_by`.

**Consequências**:
- Histórico completo
- Alinhado com normas de segurança alimentar
- Possível campo `status` = completed | corrected | pending

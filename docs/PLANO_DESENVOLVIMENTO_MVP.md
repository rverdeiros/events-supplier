# 🚀 Plano de Desenvolvimento MVP - Plataforma de Fornecedores de Eventos

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Objetivo:** Desenvolver MVP funcional da plataforma conectando clientes e fornecedores de eventos

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estado Atual do Projeto](#estado-atual-do-projeto)
3. [Escopo do MVP](#escopo-do-mvp)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Fases de Desenvolvimento](#fases-de-desenvolvimento)
6. [Sprints Detalhados](#sprints-detalhados)
7. [Critérios de Aceitação](#critérios-de-aceitação)
8. [Riscos e Mitigações](#riscos-e-mitigações)
9. [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

### Objetivo do MVP
Criar uma plataforma web funcional que permita:
- **Clientes** buscarem e encontrarem fornecedores de eventos
- **Fornecedores** criarem e gerenciarem seus perfis profissionais
- **Sistema de avaliações** moderado por administradores
- **Formulários de contato** personalizáveis para cada fornecedor

### Duração Estimada
- **Total:** 20 semanas (5 meses)
- **Equipe sugerida:** 2-3 desenvolvedores full-stack
- **Metodologia:** Sprints de 2 semanas

### Documentos Base
- [BUSINESS_RULES.md](BUSINESS_RULES.md) - Regras de negócio atualizadas
- [USER_STORIES.md](USER_STORIES.md) - Histórias de usuário detalhadas
- [ANALISE_REGRAS_NEGOCIO.md](ANALISE_REGRAS_NEGOCIO.md) - Análise de gaps
- [02_Planejamento_Tecnico_MVP.md](02_Planejamento_Tecnico_MVP.md) - Planejamento técnico

---

## Estado Atual do Projeto

### ✅ Já Implementado

**Backend:**
- ✅ Estrutura base do projeto (FastAPI)
- ✅ Modelos de dados (User, Supplier, Category, Review, Media, ContactForm)
- ✅ Schemas Pydantic básicos
- ✅ Rotas básicas implementadas
- ✅ Autenticação JWT básica
- ✅ Banco de dados PostgreSQL configurado
- ✅ Seeds de dados iniciais

**Frontend:**
- ✅ Estrutura Next.js configurada
- ✅ Componentes básicos de UI
- ✅ Integração com API básica
- ✅ Autenticação completa (login, registro, validações)
- ✅ Layout base (Header, Footer, Sidebar, Breadcrumbs)
- ✅ Tratamento de erros global (ErrorBoundary, interceptor, páginas de erro)
- ✅ Componentes de busca e visualização pública
- ✅ Sistema de avaliações (criar, editar, listar)
- ✅ Componentes de mídia e galeria
- ✅ Dashboard básico do fornecedor

### ⚠️ Precisa Ajustar/Implementar

**Backend:**
- ⚠️ Validação de senha melhorada (maiúscula + número)
- ⚠️ Token expiration aumentado para 24h
- ⚠️ Rate limiting implementado
- ⚠️ Validação de telefone (10-15 dígitos)
- ⚠️ Score de completude de perfil
- ⚠️ Edição de avaliações (janela 24h)
- ⚠️ Cálculo automático de rating médio
- ⚠️ Limites de mídia por fornecedor
- ⚠️ Validação completa de respostas de formulário
- ⚠️ Status "lida" para submissões
- ⚠️ Sanitização de HTML em inputs
- ⚠️ Índices de banco otimizados

**Frontend:**
- ✅ Páginas de autenticação completas
- ✅ Página de busca de fornecedores
- ✅ Página de detalhes do fornecedor
- 🟡 Dashboard do fornecedor (estrutura base, precisa carregar dados)
- 🟡 Painel administrativo (estrutura base, páginas pendentes)
- ✅ Tratamento de erros global
- ✅ Gerenciamento de estado (autenticação)
- ⚠️ Páginas de gestão do fornecedor (edição de perfil, formulário, submissões)
- ⚠️ Páginas administrativas completas (moderação, categorias, usuários)

---

## Escopo do MVP

### Funcionalidades Incluídas

#### Área Pública (Não Autenticada)
- ✅ Busca de fornecedores com filtros (cidade, estado, categoria, preço)
- ✅ Visualização de perfil completo do fornecedor
- ✅ Visualização de avaliações aprovadas
- ✅ Visualização de portfólio (mídia)
- ✅ Preenchimento e submissão de formulário de contato

#### Área do Cliente (Autenticada)
- ✅ Registro e login
- ✅ Criação de avaliações de fornecedores
- ✅ Edição de própria avaliação (dentro de 24h)

#### Área do Fornecedor (Autenticada)
- ✅ Criação e edição de perfil de fornecedor
- ✅ Gestão de formulário de contato (criar, editar, personalizar)
- ✅ Visualização de submissões recebidas
- ✅ Gestão de mídia (adicionar, remover)
- ✅ Dashboard com métricas básicas

#### Área Administrativa
- ✅ Moderação de avaliações (aprovar/rejeitar)
- ✅ Gestão de categorias (CRUD)
- ✅ Gestão de usuários (listar, deletar)
- ✅ Dashboard com métricas da plataforma

### Funcionalidades Excluídas (Pós-MVP)
- ❌ Upload de arquivos (apenas URLs externas)
- ❌ Notificações por email
- ❌ Busca full-text avançada
- ❌ Recuperação de senha
- ❌ Verificação de email
- ❌ Self-deletion de conta
- ❌ Refresh tokens
- ❌ Cache de dados
- ❌ Exportação de dados
- ❌ Resposta de fornecedor a avaliações

---

## Arquitetura Técnica

### Stack Tecnológica

**Backend:**
- **Framework:** FastAPI (Python 3.12+)
- **Banco de Dados:** PostgreSQL 14+
- **ORM:** SQLAlchemy + Alembic
- **Autenticação:** JWT (python-jose)
- **Validação:** Pydantic
- **Hash de Senhas:** Passlib (PBKDF2-SHA256)
- **Testes:** Pytest

**Frontend:**
- **Framework:** Next.js 14+ (React)
- **TypeScript:** Sim
- **Gerenciamento de Estado:** Context API / Zustand
- **Validação de Formulários:** React Hook Form + Zod
- **Estilização:** Tailwind CSS (ou similar)
- **Requisições HTTP:** Axios / Fetch API

**Infraestrutura:**
- **Desenvolvimento:** Docker (PostgreSQL)
- **Deploy Backend:** Render / Railway
- **Deploy Frontend:** Vercel
- **CI/CD:** GitHub Actions (básico)

### Estrutura de Pastas

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── middleware.py (rate limiting)
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── models/
│   ├── schemas/
│   ├── api/
│   │   └── v1/
│   │       └── routes/
│   ├── services/
│   ├── utils/
│   └── tests/
├── alembic/
├── alembic.ini
├── requirements.txt
└── .env

frontend/
├── src/
│   ├── app/ (Next.js App Router)
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── constants/
├── public/
├── package.json
└── .env.local
```

---

## Fases de Desenvolvimento

### Fase 1: Preparação e Refinamento (Sprint 0)
**Duração:** 2 semanas  
**Objetivo:** Consolidar documentação e preparar ambiente

### Fase 2: Backend - Core e Autenticação (Sprints 1-2)
**Duração:** 4 semanas  
**Objetivo:** Implementar autenticação robusta e estrutura base

### Fase 3: Backend - Gestão de Fornecedores (Sprints 3-4)
**Duração:** 4 semanas  
**Objetivo:** CRUD completo de fornecedores com validações

### Fase 4: Backend - Sistema de Avaliações (Sprints 5-6)
**Duração:** 4 semanas  
**Objetivo:** Sistema completo de avaliações com moderação

### Fase 5: Backend - Formulários e Mídia (Sprint 7)
**Duração:** 2 semanas  
**Objetivo:** Formulários personalizáveis e gestão de mídia

### Fase 6: Frontend - Autenticação e Layout (Sprint 8)
**Duração:** 2 semanas  
**Objetivo:** Estrutura base e autenticação no frontend

### Fase 7: Frontend - Busca e Visualização (Sprint 9)
**Duração:** 2 semanas  
**Objetivo:** Área pública de busca e visualização

### Fase 8: Frontend - Dashboard Fornecedor (Sprint 10)
**Duração:** 2 semanas  
**Objetivo:** Área logada para fornecedores

### Fase 9: Frontend - Painel Admin (Sprint 11)
**Duração:** 2 semanas  
**Objetivo:** Área administrativa

### Fase 10: Testes, Ajustes e Deploy (Sprint 12)
**Duração:** 2 semanas  
**Objetivo:** Finalização e deploy em produção

---

## Sprints Detalhados

---

## Sprint 0: Preparação e Refinamento

**Duração:** 2 semanas  
**Objetivo:** Consolidar documentação e preparar ambiente de desenvolvimento

### Tarefas

#### Semana 1
- [ ] Revisar e validar `BUSINESS_RULES.md`
- [ ] Revisar e validar `USER_STORIES.md`
- [ ] Criar backlog priorizado (Jira/Trello/GitHub Projects)
- [ ] Configurar ambiente de desenvolvimento
- [ ] Configurar CI/CD básico (GitHub Actions)
- [ ] Configurar ambiente de staging

#### Semana 2
- [ ] Definir padrões de código (linting, formatting)
- [ ] Configurar testes automatizados (estrutura base)
- [ ] Criar template de pull requests
- [ ] Documentar processo de desenvolvimento
- [ ] Kickoff com equipe

### Entregas
- ✅ Ambiente de desenvolvimento configurado
- ✅ CI/CD básico funcionando
- ✅ Backlog priorizado
- ✅ Documentação de processos

---

## Sprint 1-2: Backend - Core e Autenticação

**Duração:** 4 semanas  
**Histórias de Usuário:** US-001, US-002, US-003

### Sprint 1: Autenticação Básica

**Tarefas:**
- [ ] Implementar validação de senha melhorada (maiúscula + número)
- [ ] Ajustar token expiration para 24 horas
- [ ] Implementar endpoint de registro (`POST /auth/signup`)
- [ ] Implementar endpoint de login (`POST /auth/login`)
- [ ] Implementar endpoint de perfil próprio (`GET /auth/me`)
- [ ] Implementar middleware de autenticação
- [ ] Criar testes unitários para autenticação
- [ ] Documentar endpoints no Swagger

**Critérios de Aceitação:**
- ✅ Senha valida: mínimo 8 caracteres + 1 maiúscula + 1 número
- ✅ Token expira em 24 horas
- ✅ Registro retorna token JWT
- ✅ Login retorna token JWT
- ✅ Endpoints protegidos requerem token válido
- ✅ Testes com cobertura > 80%

### Sprint 2: Rate Limiting e Segurança

**Tarefas:**
- [ ] Implementar rate limiting para login (5 tentativas/15min por IP)
- [ ] Implementar rate limiting para criação de avaliações (10/hora por usuário)
- [ ] Implementar rate limiting para submissão de formulários (3/hora por IP)
- [ ] Implementar sanitização de HTML em inputs
- [ ] Configurar CORS adequadamente
- [ ] Adicionar logging básico
- [ ] Criar testes para rate limiting
- [ ] Documentar regras de segurança

**Critérios de Aceitação:**
- ✅ Rate limiting funciona conforme regras definidas
- ✅ HTML é escapado em comentários e descrições
- ✅ CORS configurado para produção
- ✅ Logs básicos funcionando
- ✅ Testes de segurança passando

---

## Sprint 3-4: Backend - Gestão de Fornecedores

**Duração:** 4 semanas  
**Histórias de Usuário:** US-004, US-005, US-006, US-007, US-008

### Sprint 3: CRUD de Fornecedores

**Tarefas:**
- [ ] Implementar validação de telefone (10-15 dígitos)
- [ ] Implementar endpoint de criação (`POST /fornecedores`)
- [ ] Implementar endpoint de listagem (`GET /fornecedores`) com filtros
- [ ] Implementar endpoint de detalhes (`GET /fornecedores/{id}`)
- [ ] Implementar endpoint de atualização (`PUT /fornecedores/{id}`)
- [ ] Implementar endpoint de exclusão (`DELETE /fornecedores/{id}`)
- [ ] Implementar validação de categoria ativa
- [ ] Criar testes para CRUD

**Critérios de Aceitação:**
- ✅ Telefone valida formato (10-15 dígitos)
- ✅ Apenas um fornecedor por usuário
- ✅ Filtros funcionam (city, state, category_id, price_range)
- ✅ Apenas fornecedores ativos aparecem publicamente
- ✅ Ownership verificado em update/delete
- ✅ Testes com cobertura > 80%

### Sprint 4: Completude e Ordenação

**Tarefas:**
- [ ] Implementar cálculo de score de completude
- [ ] Implementar endpoint de completude (`GET /fornecedores/{id}/completeness`)
- [ ] Implementar ordenação por rating médio
- [ ] Implementar ordenação por data (padrão)
- [ ] Adicionar índices de banco (city, state, category_id, status)
- [ ] Otimizar queries de listagem
- [ ] Criar testes de performance

**Critérios de Aceitação:**
- ✅ Score de completude calculado corretamente
- ✅ Ordenação por rating funciona
- ✅ Ordenação por data funciona (padrão)
- ✅ Queries otimizadas com índices
- ✅ Performance < 2s para listagens

---

## Sprint 5-6: Backend - Sistema de Avaliações

**Duração:** 4 semanas  
**Histórias de Usuário:** US-012, US-013, US-014, US-015

### Sprint 5: Criação e Listagem de Avaliações

**Tarefas:**
- [ ] Implementar endpoint de criação (`POST /reviews`)
- [ ] Implementar constraint de uma avaliação por usuário por fornecedor
- [ ] Implementar endpoint de listagem (`GET /reviews/supplier/{supplier_id}`)
- [ ] Implementar cálculo de rating médio
- [ ] Implementar recálculo automático após aprovação
- [ ] Adicionar índices de banco (supplier_id, status)
- [ ] Criar testes para avaliações

**Critérios de Aceitação:**
- ✅ Uma avaliação por usuário por fornecedor
- ✅ Rating médio calculado apenas com aprovadas
- ✅ Rating médio arredondado para 1 casa decimal
- ✅ Rating médio recalculado automaticamente
- ✅ Apenas avaliações aprovadas aparecem publicamente
- ✅ Testes com cobertura > 80%

### Sprint 6: Edição e Moderação

**Tarefas:**
- [ ] Implementar edição de avaliações (janela 24h)
- [ ] Implementar exclusão de avaliações
- [ ] Implementar endpoint de listagem pendentes (`GET /reviews/pending`)
- [ ] Implementar endpoint de aprovação (`PUT /reviews/{id}/approve`)
- [ ] Implementar endpoint de rejeição (`PUT /reviews/{id}/reject`)
- [ ] Implementar recálculo após edição/exclusão
- [ ] Criar testes para moderação

**Critérios de Aceitação:**
- ✅ Edição permitida dentro de 24h
- ✅ Após edição, volta para "pending"
- ✅ Admin pode aprovar/rejeitar pendentes
- ✅ Rating médio recalculado após mudanças
- ✅ Testes de moderação passando

---

## Sprint 7: Backend - Formulários e Mídia

**Duração:** 2 semanas  
**Histórias de Usuário:** US-016, US-017, US-018, US-019, US-020, US-021, US-022, US-023

### Tarefas

**Formulários de Contato:**
- [ ] Implementar validação completa de respostas
- [ ] Implementar limite de 20 questões por formulário
- [ ] Implementar status "lida" para submissões
- [ ] Implementar endpoint de criação (`POST /contact-forms`)
- [ ] Implementar endpoint de atualização (`PUT /contact-forms/{id}`)
- [ ] Implementar endpoint de submissão (`POST /contact-forms/{id}/submit`)
- [ ] Implementar endpoint de listagem de submissões (`GET /contact-forms/{id}/submissions`)
- [ ] Criar testes para formulários

**Gestão de Mídia:**
- [ ] Implementar limites de mídia (20 imagens, 5 vídeos, 10 docs)
- [ ] Implementar endpoint de criação (`POST /media`)
- [ ] Implementar endpoint de listagem (`GET /media/supplier/{supplier_id}`)
- [ ] Implementar endpoint de exclusão (`DELETE /media/{id}`)
- [ ] Criar testes para mídia

**Critérios de Aceitação:**
- ✅ Validações de respostas funcionam (obrigatórias, formato, min/max)
- ✅ Limite de questões respeitado
- ✅ Status "lida" funciona
- ✅ Limites de mídia respeitados
- ✅ Rate limiting em submissões funciona
- ✅ Testes com cobertura > 80%

---

## Sprint 8: Frontend - Autenticação e Layout

**Duração:** 2 semanas  
**Histórias de Usuário:** US-001, US-002, US-003  
**Status:** ✅ Completa

### Tarefas

- [x] Criar página de login (`/login`)
- [x] Criar página de registro (`/register`)
- [x] Implementar gerenciamento de token JWT
- [x] Implementar proteção de rotas
- [x] Criar layout base (header, footer, navegação)
- [x] Implementar tratamento de erros global
- [x] Criar componentes de UI base (botões, inputs, modais)
- [x] Implementar feedback visual (loading, success, error)
- [x] Criar ErrorBoundary e páginas de erro (404, error)
- [x] Criar Sidebar e Breadcrumbs
- [x] Endpoint `/auth/me` no backend

**Critérios de Aceitação:**
- ✅ Login funciona e salva token
- ✅ Registro funciona e redireciona
- ✅ Rotas protegidas requerem autenticação
- ✅ Token expira após 24h
- ✅ Layout responsivo (mobile-first)
- ✅ Tratamento de erros adequado

**Documentação:** Ver [IMPLEMENTACAO_FRONTEND.md](IMPLEMENTACAO_FRONTEND.md#sprint-1-autenticação-layout-base-e-infraestrutura)

---

## Sprint 9: Frontend - Busca e Visualização

**Duração:** 2 semanas  
**Histórias de Usuário:** US-006, US-007, US-009, US-010, US-011, US-013, US-017, US-018, US-022  
**Status:** ✅ Completa

### Tarefas

- [x] Criar página de busca (`/suppliers`)
- [x] Implementar filtros (cidade, estado, categoria, preço)
- [x] Implementar ordenação (data, rating)
- [x] Criar página de detalhes (`/suppliers/[id]`)
- [x] Implementar visualização de avaliações
- [x] Implementar galeria de mídia
- [x] Implementar formulário de contato público
- [x] Implementar paginação
- [x] Criar componentes: FilterBar, SupplierCard, MediaGallery, ReviewsList
- [x] Criar ReviewModal e melhorar ReviewForm (suporte a edição)

**Critérios de Aceitação:**
- ✅ Busca funciona com filtros
- ✅ Ordenação funciona
- ✅ Detalhes do fornecedor completos
- ✅ Formulário de contato funcional
- ✅ Paginação funciona
- ✅ Design responsivo

**Documentação:** Ver [IMPLEMENTACAO_FRONTEND.md](IMPLEMENTACAO_FRONTEND.md#sprint-2-busca-e-visualização-pública)

---

## Sprint 10: Frontend - Dashboard Fornecedor

**Duração:** 2 semanas  
**Histórias de Usuário:** US-004, US-005, US-008, US-016, US-019, US-020, US-021, US-023  
**Status:** 🟡 Em Progresso

### Tarefas

- [x] Criar dashboard (`/dashboard`) - estrutura base
- [x] Criar componente MetricCard
- [x] Criar página de gestão de mídia (`/dashboard/media`) - estrutura base
- [ ] Carregar dados do fornecedor do usuário logado
- [ ] Criar página de edição de perfil (`/dashboard/supplier/edit`)
- [ ] Criar página de gestão de formulário (`/dashboard/contact-form`)
- [ ] Criar página de submissões (`/dashboard/submissions`)
- [ ] Implementar indicador de completude
- [ ] Implementar contador de não lidas
- [ ] Implementar métricas no dashboard
- [ ] Criar testes E2E

**Critérios de Aceitação:**
- 🟡 Dashboard mostra métricas básicas (estrutura pronta, precisa dados)
- ⚠️ Edição de perfil funciona (pendente)
- ⚠️ Gestão de formulário funciona (pendente)
- ⚠️ Submissões listadas com status "lida" (pendente)
- 🟡 Gestão de mídia funciona (estrutura pronta, precisa dados)
- ⚠️ Indicadores visuais funcionam (pendente)

**Documentação:** Ver [IMPLEMENTACAO_FRONTEND.md](IMPLEMENTACAO_FRONTEND.md#sprint-3-dashboard-do-fornecedor)

---

## Sprint 11: Frontend - Painel Admin

**Duração:** 2 semanas  
**Histórias de Usuário:** US-015, US-024, US-025  
**Status:** 🟡 Em Progresso

### Tarefas

- [x] Estrutura base do layout admin (sidebar com links)
- [ ] Criar dashboard admin (`/admin`)
- [ ] Criar página de moderação (`/admin/reviews`)
- [ ] Criar página de categorias (`/admin/categories`)
- [ ] Criar página de usuários (`/admin/users`)
- [ ] Implementar métricas básicas
- [ ] Implementar proteção de rotas admin
- [ ] Criar testes E2E

**Critérios de Aceitação:**
- ⚠️ Dashboard admin funcional (pendente)
- ⚠️ Moderação de avaliações funciona (pendente)
- ⚠️ Gestão de categorias funciona (pendente)
- ⚠️ Gestão de usuários funciona (pendente)
- ⚠️ Métricas exibidas corretamente (pendente)

**Documentação:** Ver [IMPLEMENTACAO_FRONTEND.md](IMPLEMENTACAO_FRONTEND.md#sprint-4-painel-administrativo)

---

## Sprint 12: Testes, Ajustes e Deploy

**Duração:** 2 semanas  
**Objetivo:** Finalização e deploy em produção

### Tarefas

**Testes:**
- [ ] Escrever testes E2E críticos
- [ ] Realizar testes de carga básicos
- [ ] Testes de segurança
- [ ] Testes de acessibilidade básicos

**Ajustes:**
- [ ] Corrigir bugs identificados
- [ ] Otimizar performance
- [ ] Ajustar UX baseado em feedback
- [ ] Revisar e atualizar documentação

**Deploy:**
- [ ] Preparar ambiente de produção
- [ ] Configurar variáveis de ambiente
- [ ] Configurar banco de dados de produção
- [ ] Deploy backend em produção
- [ ] Deploy frontend em produção
- [ ] Configurar monitoramento básico
- [ ] Configurar backups automáticos

**Documentação:**
- [ ] Atualizar README
- [ ] Criar guia de deploy
- [ ] Documentar APIs
- [ ] Criar guia do usuário básico

**Critérios de Aceitação:**
- ✅ Todos os testes passando
- ✅ Performance adequada (< 2s p95)
- ✅ Zero vulnerabilidades críticas
- ✅ Deploy em produção funcionando
- ✅ Documentação completa

---

## Critérios de Aceitação Gerais

### Funcionalidade
- [ ] Todas as histórias de usuário críticas implementadas
- [ ] Validações funcionam conforme regras de negócio
- [ ] Mensagens de erro são claras e úteis
- [ ] Respostas da API seguem padrão definido

### Segurança
- [ ] Autenticação e autorização funcionam corretamente
- [ ] Dados sensíveis não são expostos
- [ ] Inputs são sanitizados
- [ ] Rate limiting funciona
- [ ] CORS configurado adequadamente

### Performance
- [ ] Queries otimizadas com índices
- [ ] Paginação implementada em todas as listagens
- [ ] Respostas < 2 segundos (p95)
- [ ] Frontend otimizado (lazy loading, code splitting)

### Qualidade
- [ ] Código segue padrões do projeto
- [ ] Cobertura de testes > 70%
- [ ] Documentação da API atualizada
- [ ] Tratamento de erros adequado
- [ ] Logs adequados para debugging

### UX/UI
- [ ] Design responsivo (mobile-first)
- [ ] Feedback visual adequado
- [ ] Acessibilidade básica (WCAG AA)
- [ ] Navegação intuitiva

---

## Riscos e Mitigações

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Performance com muitos fornecedores | Média | Alto | Implementar índices desde o início, paginação obrigatória |
| Spam de avaliações/formulários | Alta | Médio | Rate limiting implementado desde Sprint 2 |
| Falta de notificações | Baixa | Baixo | Documentado como limitação do MVP, fornecedor verifica manualmente |
| Problemas de deploy | Média | Alto | Ambiente de staging, testes antes de produção |

### Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Mudanças de escopo | Média | Médio | Documentação clara, validação constante com stakeholders |
| Falta de engajamento | Baixa | Alto | Focar em UX simples, onboarding claro |
| Dificuldade de moderação | Baixa | Médio | Dashboard admin intuitivo, treinamento |

---

## Métricas de Sucesso

### Técnicas
- ✅ Cobertura de testes > 70%
- ✅ Tempo de resposta da API < 2s (p95)
- ✅ Uptime > 99%
- ✅ Zero vulnerabilidades críticas
- ✅ Build time < 5 minutos

### Negócio
- ✅ Usuários podem se registrar e fazer login
- ✅ Fornecedores podem criar e editar perfis
- ✅ Clientes podem buscar e visualizar fornecedores
- ✅ Sistema de avaliações funciona com moderação
- ✅ Formulários de contato funcionam end-to-end
- ✅ Admin pode moderar avaliações eficientemente

### UX
- ✅ Tempo de carregamento inicial < 3s
- ✅ Navegação intuitiva (testes de usabilidade)
- ✅ Design responsivo funciona em mobile
- ✅ Feedback visual adequado em todas as ações

---

## Próximos Passos Imediatos

1. ✅ Validar este plano com stakeholders
2. ✅ Priorizar histórias de usuário para Sprint 1
3. ✅ Configurar ambiente de desenvolvimento
4. ✅ Iniciar Sprint 0 (Preparação)
5. ✅ Completar Sprint 8 (Frontend - Autenticação e Layout)
6. ✅ Completar Sprint 9 (Frontend - Busca e Visualização)
7. 🟡 Em progresso: Sprint 10 (Frontend - Dashboard Fornecedor)
8. 🟡 Em progresso: Sprint 11 (Frontend - Painel Admin)

## Documentação de Implementação

Para detalhes completos das implementações realizadas, consulte:
- [IMPLEMENTACAO_FRONTEND.md](IMPLEMENTACAO_FRONTEND.md) - Documentação detalhada do frontend

---

**Plano criado em:** Janeiro 2025  
**Próxima revisão:** Após cada sprint (retrospectiva)

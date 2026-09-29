# Weper Web

Frontend web do Weper para landing page, autenticação e painel administrativo de gestão de restaurantes.

## Stack

- React 18
- CRA / react-scripts
- React Router
- Material UI
- Axios
- Firebase Auth

## Scripts

### `npm start`

Executa a aplicação em modo desenvolvimento em `http://localhost:3000`.

### `npm test`

Executa a suíte de testes com Jest e Testing Library.

### `npm run build`

Gera o bundle de produção na pasta `build`.

## Variáveis de ambiente

Use `.env.example` como base para configurar as credenciais Firebase com o prefixo `REACT_APP_`.

## API

A URL base do backend fica em `src/services/apiConfig.js`.

## Branches e deploy

```text
feature/*  →  pull request  →  main
main       →  pull request  →  staging
staging    →  promoção manual  →  produção
```

- `main` integra o código. Push em `main` não publica produção.
- `staging` é a única branch que poderá ter deploy automático de homologação, quando o Static Site do Render for criado. Esse serviço ainda não foi ligado.
- Produção não tem auto-deploy. A promoção é manual, a partir de um commit que já está em `staging`.
- A branch `staging` ainda não existe. Ela deve nascer do commit que já contiver as demandas 001 a 007. Criá-la antes disso publicaria o bundle que ainda cai em `localhost` quando a variável de API não está definida.

O GitHub Actions em `.github/workflows/ci.yml` roda `npm ci` e os testes em pull requests e pushes para `main` e `staging`. O workflow não faz deploy.

# Weper Pricing Configuration

## Arquivos

- **pricingTiers.js** - Configuração central das faixas de preço
- **weperFeatures.js** - Lista de funcionalidades da plataforma

## Modelo de Preços

A Weper utiliza um modelo de **assinatura única** com mensalidade variável baseada no volume mensal processado pela plataforma.

### Faixas Atuais

| Volume Mensal Processado | Mensalidade |
|--------------------------|-------------|
| Até R$ 1.000 | R$ 39,90 |
| R$ 1.000,01 até R$ 2.000 | R$ 69,90 |
| R$ 2.000,01 até R$ 4.000 | R$ 89,90 |
| R$ 4.000,01 até R$ 7.000 | R$ 99,90 |
| Acima de R$ 7.000 | R$ 149,90 |

**Teto da mensalidade:** R$ 149,90/mês

## Funcionalidades

Todas as funcionalidades estão **incluídas** independentemente da faixa de preço:

- PDV
- App Garçom
- Mesas e Comandas
- KDS / Cozinha
- Cardápio Digital
- Delivery Próprio
- Autoatendimento
- Controle de Estoque
- Dashboard
- Relatórios
- Pagamentos
- Gestão de Colaboradores

## Integração com Backend

### Status Atual

Os valores estão configurados estaticamente em `pricingTiers.js`.

### Próximos Passos

Quando o endpoint estiver disponível:

1. **Endpoint esperado:** `GET /api/pricing/tiers`

2. **Estrutura de resposta esperada:**

```json
{
  "tiers": [
    {
      "id": "tier-1",
      "minRevenue": 0,
      "maxRevenue": 1000,
      "monthlyPrice": 39.90,
      "label": "Até R$ 1.000",
      "description": "Ideal para quem está começando",
      "isMaxTier": false
    },
    {
      "id": "tier-2",
      "minRevenue": 1000.01,
      "maxRevenue": 2000,
      "monthlyPrice": 69.90,
      "label": "R$ 1.000,01 até R$ 2.000",
      "description": "Para operações em crescimento",
      "isMaxTier": false
    }
  ],
  "currency": "BRL"
}
```

3. **Onde conectar:**

Em `src/config/pricingTiers.js`, adicionar:

```javascript
// Serviço para buscar tiers do backend
export async function fetchPricingTiers() {
  const response = await fetch('/api/pricing/tiers');
  const data = await response.json();
  return data.tiers;
}
```

4. **Componente que utiliza:**

O componente principal é `NewPlansSection.js` e importa diretamente de `pricingTiers.js`.

Quando a integração estiver pronta, atualizar o componente para:

```javascript
const [tiers, setTiers] = useState(PRICING_TIERS); // fallback local

useEffect(() => {
  fetchPricingTiers()
    .then(setTiers)
    .catch(err => {
      console.error('Erro ao carregar faixas de preço:', err);
      // Continua usando PRICING_TIERS local
    });
}, []);
```

## Cálculo da Mensalidade

A função `calculateMonthlyPrice(revenue)` em `pricingTiers.js` retorna o valor da mensalidade baseado no volume informado.

Exemplo:
```javascript
import { calculateMonthlyPrice } from './config/pricingTiers';

const volume = 3500; // R$ 3.500
const mensalidade = calculateMonthlyPrice(volume); // R$ 89,90
```

## Observações Importantes

1. **Volume mensal** refere-se às vendas **processadas pela Weper**, não ao faturamento total contábil do estabelecimento.

2. O cálculo considera vendas **elegíveis** (futuro: implementar regras de cancelamentos, estornos).

3. A mensalidade é ajustada **automaticamente** conforme o volume muda de faixa.

4. Não existem bloqueios de funcionalidades por faixa de preço.

## Manutenção

Para alterar valores ou adicionar novas faixas:

1. Editar `PRICING_TIERS` em `src/config/pricingTiers.js`
2. Manter ordem crescente por `minRevenue`
3. Última faixa deve ter `maxRevenue: Infinity` e `isMaxTier: true`
4. Testes de responsividade e dark mode devem ser validados após alterações

## SEO

A página de planos está configurada com:

- **Title:** "Planos Weper | Gestão completa a partir de R$ 39,90"
- **Description:** "Tenha acesso às funcionalidades da Weper e pague de acordo com o volume da sua operação. App Garçom, PDV, Delivery, KDS, Estoque e muito mais."

Ajustar em `public/index.html` ou criar meta tags dinâmicas conforme necessário.

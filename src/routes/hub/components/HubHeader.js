import { WeperMark } from '../../home/components/WeperMark';

/**
 * Cabeçalho do Hub: logo, slogan e introdução
 * REDESIGN: mais compacto e com hierarquia clara
 */
export default function HubHeader() {
  return (
    <header className="hub-header">
      <div className="hub-logo">
        <WeperMark size={32} />
      </div>
      <p className="hub-slogan">Do pedido ao resultado</p>
      <h1 className="hub-title">Tudo para seu negócio vender mais.</h1>
      <p className="hub-description">
        Delivery próprio, gestão de pedidos, mesas, cozinha, estoque, pagamentos e muito mais.
      </p>
    </header>
  );
}

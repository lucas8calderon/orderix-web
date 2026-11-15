import { WeperMark } from '../../home/components/WeperMark';

/**
 * Cabeçalho do Hub: logo, slogan e introdução
 */
export default function HubHeader() {
  return (
    <header className="hub-header">
      <div className="hub-logo">
        <WeperMark size={40} />
        <span className="hub-logo-text">Weper</span>
      </div>
      <p className="hub-slogan">Do pedido ao resultado</p>
      <p className="hub-intro">
        Tudo que seu negócio precisa para vender mais e gerenciar melhor.
        Conheça nossas soluções.
      </p>
    </header>
  );
}

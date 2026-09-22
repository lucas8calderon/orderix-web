export default function DemoBanner({ onReset }) {
  return (
    <div className="demo-banner" role="status">
      <p>Você está explorando uma demonstração da Weper.</p>
      <button type="button" className="demo-banner__reset" onClick={onReset}>
        Reiniciar demonstração
      </button>
    </div>
  );
}

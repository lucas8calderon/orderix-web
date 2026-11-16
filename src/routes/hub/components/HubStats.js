/**
 * Seção de indicadores de marketing do Weper Hub
 * Exibe estatísticas para reforçar credibilidade
 */
export default function HubStats() {
  const stats = [
    {
      value: '+500',
      label: 'Estabelecimentos',
    },
    {
      value: '4,9 ⭐',
      label: 'Avaliação média',
    },
    {
      value: '98%',
      label: 'Satisfação',
    },
  ];

  return (
    <section className="hub-stats" aria-label="Indicadores">
      <div className="hub-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="hub-stat-item">
            <div className="hub-stat-value">{stat.value}</div>
            <div className="hub-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Search, ArrowUpRight, X, SlidersHorizontal } from 'lucide-react';
import { searchSettings } from '../settingsSections';

export function SettingsFinder({ onNavigate }) {
  const [query, setQuery] = useState('');
  const results = searchSettings(query);
  const searching = query.trim().length >= 2;
  return <section className="settings-finder" aria-label="Encontrar configuração">
    <div className="settings-finder__intro"><SlidersHorizontal size={22} /><div><strong>O que você quer configurar?</strong><p>Encontre uma opção ou escolha um assunto abaixo.</p></div></div>
    <div className="settings-finder__field"><Search size={19} aria-hidden="true" /><input type="search" aria-label="Buscar configurações" placeholder="Busque por Pix, horários, delivery…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={17} /></button>}</div>
    {searching && <div className="settings-finder__results"><p role="status">{results.length ? `${results.length} opções encontradas` : 'Nenhuma opção encontrada. Tente outro termo, como horários ou pagamentos.'}</p>{results.map(result => <button type="button" key={result.id} onClick={() => { onNavigate(result.section); setQuery(''); }}><span><strong>{result.title}</strong><small>{result.hint}</small></span><ArrowUpRight size={18} /></button>)}</div>}
  </section>;
}

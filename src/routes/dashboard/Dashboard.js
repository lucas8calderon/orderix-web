import * as React from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { dashboardItems } from './listItems';
import { DashboardGerencial } from './dashboard-gerencial/DashboardGerencial';
import { Menu } from './menu/Menu';
import { Atendimento } from './atendimento/Atendimento';
import { Kitchen } from './kitchen/Kitchen';
import { Employees } from './employees/Employees';
import { WaiterHome } from './WaiterHome';
import { Settings } from './settings/Settings';
import InventoryPanel from './inventory/Inventory';
import { getCurrentUser, logout } from '../../services/authService';
import { canAccessRoute, getPostLoginPath, getVisibleDashboardItems, PATHS } from '../../services/accessControl';
import { AppShell } from '../../commons/components/AppShell';
import weperLogo from '../../assets/images/weper-logo.png';
import './Workspace.css';
import './WorkspaceRebrand.css';

const GROUPS = [
  { label: 'Visão geral', slugs: ['dashboard'] },
  { label: 'Operação', slugs: ['atendimento', 'cozinha', 'garcom'] },
  { label: 'Gestão', slugs: ['produtos', 'estoque', 'colaboradores'] },
  { label: 'Sistema', slugs: ['configuracoes'] },
];

export default function Dashboard() {
  const user = getCurrentUser();
  const visibleItems = getVisibleDashboardItems(user, dashboardItems)
    .filter((item) => canAccessRoute(user, item.path));
  const navigate = useNavigate();
  const { section } = useParams();
  const [navIntent, setNavIntent] = React.useState(null);
  const selectedItem = visibleItems.find((item) => item.slug === section);

  const goToScreen = (title, intent) => {
    const item = visibleItems.find((entry) => entry.title === title);
    if (!item) return;
    setNavIntent(intent || null);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  const screens = {
    dashboard: <DashboardGerencial onNavigate={goToScreen} />,
    colaboradores: <Employees />,
    produtos: <Menu />,
    estoque: <InventoryPanel />,
    atendimento: <Atendimento />,
    cozinha: <Kitchen initialFilter={navIntent?.kitchenFilter} />,
    garcom: <WaiterHome user={user} />,
    configuracoes: <Settings />,
  };

  if (!selectedItem) return <Navigate to={getPostLoginPath(user)} replace />;

  const groupedSlugs = new Set(GROUPS.flatMap((group) => group.slugs));
  const groups = GROUPS.map((group) => ({
    label: group.label,
    items: visibleItems
      .filter((item) => group.slugs.includes(item.slug))
      .map((item) => ({
        key: item.slug,
        title: item.title,
        icon: item.icon,
        to: item.path,
        selected: item.slug === section,
      })),
  }));

  const ungrouped = visibleItems.filter((item) => !groupedSlugs.has(item.slug));
  if (ungrouped.length) {
    groups.push({
      label: 'Outros',
      items: ungrouped.map((item) => ({
        key: item.slug,
        title: item.title,
        icon: item.icon,
        to: item.path,
        selected: item.slug === section,
      })),
    });
  }

  return (
    <AppShell
      className="weper-establishment"
      logo={weperLogo}
      contextLabel={user?.storeName || 'Weper'}
      contextHint={selectedItem.title}
      groups={groups}
      accountName={user?.name || 'Minha conta'}
      accountHint="Gestão do estabelecimento"
      onLogout={handleLogout}
      onNavigate={() => setNavIntent(null)}
    >
      {selectedItem.slug === 'dashboard' && <section className="workspace-launchpad" aria-label="Acessos rápidos">
        <div className="workspace-launchpad__intro"><span>Seu centro de controle</span><strong>Vamos cuidar do seu negócio.</strong><p>Acompanhe os resultados e vá direto para a próxima tarefa.</p></div>
        <div className="workspace-launchpad__links">{visibleItems.filter(item => ['atendimento', 'cozinha', 'produtos', 'configuracoes'].includes(item.slug)).map(item => <Link key={item.slug} to={item.path}>{item.icon}<span>{item.title}</span></Link>)}</div>
      </section>}
      {screens[selectedItem.slug]}
    </AppShell>
  );
}

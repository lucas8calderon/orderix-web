import * as React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { dashboardItems } from './listItems';
import { DashboardGerencial } from './dashboard-gerencial/DashboardGerencial';
import { Menu } from './menu/Menu';
import { Atendimento } from './atendimento/Atendimento';
import { Kitchen } from './kitchen/Kitchen';
import { Employees } from './employees/Employees';
import { WaiterHome } from './WaiterHome';
import { Settings } from './settings/Settings';
import { getCurrentUser, logout } from '../../services/authService';
import { getPostLoginPath, getVisibleDashboardItems, PATHS } from '../../services/accessControl';
import { AppShell } from '../../commons/components/AppShell';
import weperLogo from '../../assets/images/weper-logo.png';
import './Workspace.css';

const GROUPS = [
  { label: 'Visão geral', slugs: ['dashboard'] },
  { label: 'Operação', slugs: ['atendimento', 'cozinha', 'garcom'] },
  { label: 'Gestão', slugs: ['produtos', 'colaboradores'] },
  { label: 'Sistema', slugs: ['configuracoes'] },
];

export default function Dashboard() {
  const user = getCurrentUser();
  const visibleItems = getVisibleDashboardItems(user, dashboardItems);
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
      logo={weperLogo}
      contextLabel={user?.storeName || 'Weper'}
      contextHint={selectedItem.title}
      groups={groups}
      accountName={user?.name || 'Minha conta'}
      accountHint="Gestão do estabelecimento"
      onLogout={handleLogout}
      onNavigate={() => setNavIntent(null)}
    >
      {screens[selectedItem.slug]}
    </AppShell>
  );
}

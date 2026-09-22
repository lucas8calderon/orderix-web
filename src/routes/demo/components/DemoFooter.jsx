import { Link } from 'react-router-dom';
import { PATHS } from '../../../services/accessControl';

export default function DemoFooter() {
  return (
    <footer className="demo-footer">
      <Link to={PATHS.HOME}>Cardápio digital por Weper</Link>
    </footer>
  );
}

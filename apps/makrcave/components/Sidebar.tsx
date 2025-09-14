import { useKeycloak } from '@makrx/auth';
import SuperAdminSidebar from './SuperAdminSidebar';
import ManagerSidebar from './ManagerSidebar';
import MakerSidebar from './MakerSidebar';

export default function Sidebar() {
  const { user, hasRole } = useKeycloak();

  // Render role-specific sidebar based on Keycloak roles
  if (hasRole('super_admin')) {
    return <SuperAdminSidebar />;
  }

  if (hasRole('makerspace_admin') || hasRole('admin')) {
    return <ManagerSidebar />;
  }

  // Default sidebar for regular users
  return <MakerSidebar />;

  // Fallback to MakerSidebar if role is unclear
  return <MakerSidebar />;
}

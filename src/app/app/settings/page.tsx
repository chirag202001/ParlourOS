import { getTenantSettings, getRoles, getSubscription } from './actions';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const [tenant, roles, subscription] = await Promise.all([
    getTenantSettings(),
    getRoles(),
    getSubscription(),
  ]);

  return (
    <SettingsClient
      tenant={tenant}
      roles={roles}
      subscription={subscription}
    />
  );
}

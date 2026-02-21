import { getPackages, getCustomerPackages } from './actions';
import { PackagesClient } from './packages-client';

export default async function PackagesPage() {
  const [packages, customerPackages] = await Promise.all([
    getPackages(),
    getCustomerPackages(),
  ]);
  return <PackagesClient packages={packages} customerPackages={customerPackages} />;
}

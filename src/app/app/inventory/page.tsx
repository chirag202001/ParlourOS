import { getStockSummary, getVendors } from './actions';
import { InventoryClient } from './inventory-client';

export default async function InventoryPage() {
  const [stockSummary, vendors] = await Promise.all([
    getStockSummary(),
    getVendors(),
  ]);

  return <InventoryClient stockSummary={stockSummary} vendors={vendors} />;
}

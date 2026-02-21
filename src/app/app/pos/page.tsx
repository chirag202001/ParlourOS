import {
  getInvoices,
  getServicesForPOS,
  getProductsForPOS,
  getCustomersForPOS,
  getBranchesForPOS,
} from './actions';
import { POSClient } from './pos-client';

export default async function POSPage() {
  const [invoices, services, products, customers, branches] = await Promise.all([
    getInvoices(),
    getServicesForPOS(),
    getProductsForPOS(),
    getCustomersForPOS(),
    getBranchesForPOS(),
  ]);

  return (
    <POSClient
      invoices={invoices}
      services={services}
      products={products}
      customers={customers}
      branches={branches}
    />
  );
}

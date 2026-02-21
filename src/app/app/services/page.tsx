import { getServices } from './actions';
import { ServicesList } from './services-list';

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesList services={services} />;
}

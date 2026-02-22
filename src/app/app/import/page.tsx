import { getImportStats } from './actions';
import { ImportClient } from './import-client';

export default async function ImportPage() {
  const stats = await getImportStats();

  return <ImportClient stats={stats} />;
}

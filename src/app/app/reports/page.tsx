import {
  getRevenueReport,
  getServiceMixReport,
  getStaffPerformanceReport,
  getCustomerRetentionReport,
  getGSTSummary,
} from './actions';
import { ReportsClient } from './reports-client';

export default async function ReportsPage() {
  const [revenueReport, serviceMix, staffPerformance, retention, gstSummary] =
    await Promise.all([
      getRevenueReport('month'),
      getServiceMixReport(),
      getStaffPerformanceReport(),
      getCustomerRetentionReport(),
      getGSTSummary(),
    ]);

  return (
    <ReportsClient
      revenueReport={revenueReport}
      serviceMix={serviceMix}
      staffPerformance={staffPerformance}
      retention={retention}
      gstSummary={gstSummary}
    />
  );
}

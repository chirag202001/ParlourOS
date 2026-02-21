import { getMessageTemplates, getCampaigns, getReviewLinks } from './actions';
import { MarketingClient } from './marketing-client';

export default async function MarketingPage() {
  const [templates, campaigns, reviewLinks] = await Promise.all([
    getMessageTemplates(),
    getCampaigns(),
    getReviewLinks(),
  ]);

  return (
    <MarketingClient
      templates={templates}
      campaigns={campaigns}
      reviewLinks={reviewLinks}
    />
  );
}

import { CONFIG } from 'src/global-config';

import JobAnalysisView from 'src/sections/job-analysis/view';

// ----------------------------------------------------------------------

const metadata = { title: `Analyse d'offres d'emploi | Dashboard - ${CONFIG.appName}` };

export default function JobAnalysisPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <JobAnalysisView />
    </>
  );
}

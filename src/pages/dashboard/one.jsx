import { CONFIG } from 'src/global-config';

import { CVView } from 'src/sections/cv/view';

// ----------------------------------------------------------------------

const metadata = { title: `Créateur de CV | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CVView />
    </>
  );
}

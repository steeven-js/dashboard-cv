import CVWithPDF from 'src/sections/cv/view';

// import { BlankView } from 'src/sections/blank/view';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Page one | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      {/* <BlankView title="Page one" /> */}
      <CVWithPDF />
    </>
  );
}

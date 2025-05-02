import { CONFIG } from 'src/global-config';

// import { BlankView } from 'src/sections/blank/view';
import CVWithPDF from 'src/sections/cv/view';

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

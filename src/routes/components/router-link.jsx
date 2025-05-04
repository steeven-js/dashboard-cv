import { Link } from 'react-router';

// ----------------------------------------------------------------------

export function RouterLink({ href, ref, isNavLogo, ...other }) {
  return <Link ref={ref} to={href} {...other} />;
}

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

export default function DashboardContent({ children, title, sx, ...other }) {
  return (
    <>
      {title && (
        <title>{`${title} | Madinia Dashboard`}</title>
      )}

      <Container maxWidth="xl" sx={{ pt: 3, ...sx }} {...other}>
        {children}
      </Container>
    </>
  );
}

DashboardContent.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  sx: PropTypes.object,
};

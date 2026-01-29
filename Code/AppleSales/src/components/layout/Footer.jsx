import { Box, Container, Typography, Link, Grid } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import logoImg from '../../assets/mm.png';

/**
 * Footer Component
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.100',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src={logoImg}
                alt="Manzana Mordida"
                sx={{ height: 36 }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Exo 2", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.05rem',
                }}
              >
                Manzana Mordida
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400" paragraph>
              Dispositivos Apple sellados, seminuevos y usados de calidad.
              Comprá con confianza.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Enlaces Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="grey.400" underline="hover">
                Inicio
              </Link>
              <Link href="/dispositivos" color="grey.400" underline="hover">
                Dispositivos
              </Link>
              <Link href="/login" color="grey.400" underline="hover">
                Iniciar Sesión
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  manzanamordida.lr@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  +54 380 4280591/+54 380 4805100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  La Rioja, Argentina
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'grey.800',
            mt: 4,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="grey.500">
            © {currentYear} <Box component="span" sx={{ fontFamily: '"Exo 2", sans-serif', fontWeight: 600 }}>Manzana Mordida</Box>. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

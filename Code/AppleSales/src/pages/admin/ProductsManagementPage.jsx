import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Palette as ColorIcon,
  Category as ProductIcon,
  PhoneIphone as EquipoIcon,
} from '@mui/icons-material';
import { ColorsTab } from '../../components/admin/products/ColorsTab';
import { ProductsTab } from '../../components/admin/products/ProductsTab';
import { DevicesTab } from '../../components/admin/products/DevicesTab';

/**
 * ProductsManagementPage - Admin page with tabs for Colors, Products, and Devices
 * Hierarchy: Colors → Products (with colors) → Devices (instances of products)
 */
export const ProductsManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <DevicesIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1">
            Gestión de Productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administrar colores, modelos de productos y dispositivos
          </Typography>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<ColorIcon />}
            label="Colores"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<ProductIcon />}
            label="Productos (Modelos)"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<EquipoIcon />}
            label="Dispositivos (Stock)"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && <ColorsTab />}
        {activeTab === 1 && <ProductsTab />}
        {activeTab === 2 && <DevicesTab />}
      </Box>
    </Container>
  );
};

export default ProductsManagementPage;

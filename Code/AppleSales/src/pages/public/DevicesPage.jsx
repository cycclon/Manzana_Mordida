import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../api/products';
import { handleApiError } from '../../api/client';
import DeviceFilters from '../../components/devices/DeviceFilters';
import DeviceGrid from '../../components/devices/DeviceGrid';
import { useDebounce } from '../../hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { toast } from 'react-hot-toast';

/**
 * DevicesPage - Main marketplace for browsing devices
 */
export const DevicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  // Initialize filters from URL params
  const initialSearch = searchParams.get('search') || '';

  // Filters state
  const [filters, setFilters] = useState({
    search: initialSearch,
    condition: '',
    storage: '',
    minPrice: 0,
    maxPrice: 5000,
    minBattery: 0,
  });

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
      };

      // Add filters to params
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (filters.condition) {
        params.condition = filters.condition;
      }
      if (filters.storage) {
        params.storage = filters.storage;
      }
      if (filters.minPrice > 0) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice < 5000) {
        params.maxPrice = filters.maxPrice;
      }
      if (filters.minBattery > 0) {
        params.minBatteryHealth = filters.minBattery;
      }

      const response = await productsAPI.getAllDevices(params);

      // Handle different response structures
      if (response.data) {
        setDevices(response.data);
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        setDevices(response);
        setTotalPages(1);
      } else {
        setDevices([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchDevices();
  }, [page, debouncedSearch, filters.condition, filters.storage, filters.minPrice, filters.maxPrice, filters.minBattery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, filters.condition, filters.storage, filters.minPrice, filters.maxPrice, filters.minBattery]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = (emptyFilters) => {
    setFilters(emptyFilters);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dispositivos Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora nuestra selección de dispositivos Apple reacondicionados
          </Typography>
        </Box>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ListViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <DeviceFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Device Grid */}
      <DeviceGrid
        devices={devices}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Container>
  );
};

export default DevicesPage;

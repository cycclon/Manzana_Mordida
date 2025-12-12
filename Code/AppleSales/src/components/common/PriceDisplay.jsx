import { Box, Typography, Skeleton } from '@mui/material';
import { useCurrency } from '../../hooks/useCurrency';
import { gradientTextPrice } from '../../theme';

/**
 * PriceDisplay - Display price in USD and ARS
 * USD is displayed larger (primary), ARS smaller (secondary)
 */
export const PriceDisplay = ({
  usdAmount,
  showARS = true,
  usdVariant = 'h5',
  arsVariant = 'body2',
  direction = 'column',
  adjustWithTradeIn = false,
}) => {
  const { formatBothCurrencies, isLoading } = useCurrency();

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={100} height={40} />
        {showARS && <Skeleton variant="text" width={80} height={20} />}
      </Box>
    );
  }

  const { usd, ars } = formatBothCurrencies(usdAmount);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: direction === 'row' ? 2 : 0,
        alignItems: direction === 'row' ? 'center' : 'flex-start',
      }}
    >
      {/* USD Price (Primary) */}
      <Typography
        variant={usdVariant}
        component="div"
        sx={{
          fontWeight: 700,
          ...gradientTextPrice,
        }}
      >
        {usd}
      </Typography>

      {/* ARS Price (Secondary) */}
      {showARS && (
        <Typography
          variant={arsVariant}
          component="div"
          sx={{
            color: 'text.secondary',
          }}
        >
          {ars}
        </Typography>
      )}
    </Box>
  );
};

export default PriceDisplay;

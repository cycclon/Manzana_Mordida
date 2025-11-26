import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * ErrorMessage - Display error messages with optional retry
 */
export const ErrorMessage = ({
  title = 'Error',
  message = 'Ha ocurrido un error',
  onRetry,
  severity = 'error',
}) => {
  return (
    <Alert
      severity={severity}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Reintentar
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;

import { Chip } from '@mui/material';
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from '../../constants';

/**
 * StatusChip - Display status with appropriate color
 */
export const StatusChip = ({ status, type = 'appointment', size = 'small' }) => {
  let label, color;

  if (type === 'appointment') {
    label = APPOINTMENT_STATUS_LABELS[status] || status;
    color = APPOINTMENT_STATUS_COLORS[status] || 'default';
  } else if (type === 'reservation') {
    label = RESERVATION_STATUS_LABELS[status] || status;
    color = RESERVATION_STATUS_COLORS[status] || 'default';
  } else {
    label = status;
    color = 'default';
  }

  return <Chip label={label} color={color} size={size} />;
};

export default StatusChip;

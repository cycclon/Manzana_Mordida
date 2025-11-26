import { useState } from 'react';
import {
  Box,
  IconButton,
  MobileStepper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';

/**
 * ImageCarousel - Swipeable image carousel with zoom capability
 * Features: Touch swipe, keyboard navigation, fullscreen zoom, mobile-optimized
 */
export const ImageCarousel = ({ images = [], alt = 'Device image' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const maxSteps = images.length;

  // Handle navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleBack(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') handleBack();
    if (event.key === 'ArrowRight') handleNext();
    if (event.key === 'Escape') setIsZoomed(false);
  };

  // No images
  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: { xs: 300, md: 500 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <img
            src="/placeholder-device.png"
            alt="No image available"
            style={{ maxWidth: '200px', opacity: 0.5 }}
          />
        </Box>
      </Box>
    );
  }

  // Single image (no carousel needed)
  if (images.length === 1) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={images[0].url || images[0]}
          alt={alt}
          sx={{
            width: '100%',
            height: { xs: 300, md: 500 },
            objectFit: 'contain',
            bgcolor: 'grey.50',
            borderRadius: 2,
            cursor: 'zoom-in',
          }}
          onClick={() => setIsZoomed(true)}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
          onClick={() => setIsZoomed(true)}
        >
          <ZoomInIcon />
        </IconButton>

        {/* Zoomed view */}
        {isZoomed && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
            }}
            onClick={() => setIsZoomed(false)}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              }}
              onClick={() => setIsZoomed(false)}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={images[0].url || images[0]}
              alt={alt}
              sx={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </Box>
    );
  }

  // Multiple images (full carousel)
  return (
    <Box sx={{ position: 'relative' }} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main carousel container */}
      <Box
        {...handlers}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 300, md: 500 },
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'grey.50',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {/* Images */}
        {images.map((image, index) => (
          <Box
            key={index}
            component="img"
            src={image.url || image}
            alt={`${alt} ${index + 1}`}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
              transform: `translateX(${(index - activeStep) * 100}%)`,
              opacity: index === activeStep ? 1 : 0,
            }}
            onClick={() => setIsZoomed(true)}
          />
        ))}

        {/* Navigation buttons */}
        {!isMobile && (
          <>
            <IconButton
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'white' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'white' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </>
        )}

        {/* Zoom button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(true);
          }}
        >
          <ZoomInIcon />
        </IconButton>

        {/* Image counter */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {activeStep + 1} / {maxSteps}
        </Box>
      </Box>

      {/* Stepper (dots) */}
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{
          bgcolor: 'transparent',
          justifyContent: 'center',
          mt: 2,
          '& .MuiMobileStepper-dot': {
            width: 12,
            height: 12,
            cursor: 'pointer',
          },
          '& .MuiMobileStepper-dotActive': {
            bgcolor: 'primary.main',
          },
        }}
        nextButton={<span />}
        backButton={<span />}
      />

      {/* Thumbnail navigation (desktop only) */}
      {!isMobile && images.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.400',
              borderRadius: 3,
            },
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              component="img"
              src={image.url || image}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => handleStepChange(index)}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                border: index === activeStep ? 2 : 1,
                borderColor: index === activeStep ? 'primary.main' : 'grey.300',
                opacity: index === activeStep ? 1 : 0.6,
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 1,
                  borderColor: 'primary.main',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Fullscreen zoomed view */}
      {isZoomed && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsZoomed(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Navigation in fullscreen */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            disabled={activeStep === 0}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-disabled': { opacity: 0.3 },
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>

          {/* Zoomed image */}
          <Box
            component="img"
            src={images[activeStep].url || images[activeStep]}
            alt={`${alt} ${activeStep + 1}`}
            sx={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={activeStep === maxSteps - 1}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-disabled': { opacity: 0.3 },
            }}
          >
            <KeyboardArrowRight />
          </IconButton>

          {/* Counter in fullscreen */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {activeStep + 1} / {maxSteps}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageCarousel;

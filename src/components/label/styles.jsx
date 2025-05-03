import { varAlpha } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const LabelRoot = styled('span', {
  shouldForwardProp: (prop) => !['color', 'variant', 'disabled', 'sx'].includes(prop),
})(({ color, variant, disabled, theme }) => {
  const defaultStyles = {
    ...(color === 'default' && {
      /**
       * @variant filled
       */
      ...(variant === 'filled' && {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.text.primary,
        ...theme.applyStyles?.('dark', {
          color: theme.palette.grey[800],
        }),
      }),
      /**
       * @variant outlined
       */
      ...(variant === 'outlined' && {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.text.primary}`,
      }),
      /**
       * @variant soft
       */
      ...(variant === 'soft' && {
        color: theme.palette.text.secondary,
        backgroundColor: varAlpha(theme.palette.grey['500Channel'], 0.16),
      }),
      /**
       * @variant inverted
       */
      ...(variant === 'inverted' && {
        color: theme.palette.grey[800],
        backgroundColor: theme.palette.grey[300],
      }),
    }),
  };

  const colorStyles = {
    ...(color &&
      color !== 'default' &&
      theme.palette[color] && {
        /**
         * @variant filled
         */
        ...(variant === 'filled' && {
          color: theme.palette[color].contrastText || theme.palette.common.white,
          backgroundColor: theme.palette[color].main || theme.palette.grey[500],
        }),
        /**
         * @variant outlined
         */
        ...(variant === 'outlined' && {
          backgroundColor: 'transparent',
          color: theme.palette[color].main || theme.palette.grey[500],
          border: `2px solid ${theme.palette[color].main || theme.palette.grey[500]}`,
        }),
        /**
         * @variant soft
         */
        ...(variant === 'soft' && {
          color: theme.palette[color].dark || theme.palette.grey[700],
          backgroundColor: varAlpha(
            theme.palette[color].mainChannel || theme.palette.grey['500Channel'],
            0.16
          ),
          ...(theme.applyStyles && {
            ...theme.applyStyles('dark', {
              color: theme.palette[color]?.light || theme.palette.grey[300],
            }),
          }),
        }),
        /**
         * @variant inverted
         */
        ...(variant === 'inverted' && {
          color: theme.palette[color].darker || theme.palette.grey[800],
          backgroundColor: theme.palette[color].lighter || theme.palette.grey[300],
        }),
      }),
  };

  return {
    height: 24,
    minWidth: 24,
    lineHeight: 0,
    flexShrink: 0,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    gap: theme.spacing(0.75),
    justifyContent: 'center',
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightBold,
    borderRadius: theme.shape.borderRadius * 0.75,
    transition: theme.transitions.create(['all'], { duration: theme.transitions.duration.shorter }),
    ...defaultStyles,
    ...colorStyles,
    ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
  };
});

// ----------------------------------------------------------------------

export const LabelIcon = styled('span')({
  width: 16,
  height: 16,
  flexShrink: 0,
  '& svg, img': { width: '100%', height: '100%', objectFit: 'cover' },
});

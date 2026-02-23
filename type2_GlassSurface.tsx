import React, { memo } from 'react';
import clsx from 'clsx';
import './IconButton.css';
import * as Icons from '../../icons/index';

/* ----------------------------------
 * Types & Helpers
 * ---------------------------------- */
export type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type IconTone = 'default' | 'positive' | 'negative' | 'warning';
export type IconVersion = 'primary' | 'secondary' | 'tertiary';
export type IconName = keyof typeof Icons;

export interface IconButtonProps {
  icon: IconName | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: IconSize;
  tone?: IconTone;
  version?: IconVersion;
  inverse?: boolean;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

const resolveIcon = (
  icon: IconButtonProps['icon']
): React.ComponentType<React.SVGProps<SVGSVGElement>> | null => {
  if (typeof icon === 'string') return Icons[icon] ?? null;
  return icon;
};

/* ----------------------------------
 * Filter — render once at the app root via <IconButtonFilterDefs />
 * ---------------------------------- */
export const IconButtonFilterDefs: React.FC = () => (
  <svg
    className="filter"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    aria-hidden
  >
    <defs>
      <filter id="icon-button-filter" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          id="redchannel"
          xChannelSelector="R"
          yChannelSelector="G"
          result="dispRed"
        />
        <feColorMatrix
          in="dispRed"
          type="matrix"
          values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="red"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          id="greenchannel"
          xChannelSelector="R"
          yChannelSelector="G"
          result="dispGreen"
        />
        <feColorMatrix
          in="dispGreen"
          type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="green"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          id="bluechannel"
          xChannelSelector="R"
          yChannelSelector="G"
          result="dispBlue"
        />
        <feColorMatrix
          in="dispBlue"
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0"
          result="blue"
        />
        <feBlend in="red" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blue" mode="screen" result="output" />
        <feGaussianBlur in="output" stdDeviation="0.7" />
      </filter>
    </defs>
  </svg>
);

/* ----------------------------------
 * Component
 * ---------------------------------- */
const IconButtonBase: React.FC<IconButtonProps> = ({
  icon,
  size = 'm',
  tone = 'default',
  version = 'primary',
  inverse = false,
  className,
  disabled = false,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const SvgIcon = resolveIcon(icon);

  if (!SvgIcon) return null;

  const wrapperClasses = clsx(
    'icon-button',
    `icon-button--${size}`,
    `icon-button--${tone}--${version}`,
    inverse && 'icon-button--inverse',
    disabled && 'icon-button--disabled',
    className
  );

  return (
    <div className={wrapperClasses}>
      <div className="icon-button__glass-outer">
        <div className="icon-button__glass">
          <button
            className="icon-button__inner"
            title={ariaLabel}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            type={type}
          >
            <span className="icon-button__glow" aria-hidden />
            <span className="icon-button__icon">
              <SvgIcon />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

IconButtonBase.displayName = 'IconButton';

export const IconButton = memo(IconButtonBase);
export default IconButton;

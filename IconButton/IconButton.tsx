import React, { memo, Suspense } from 'react';
import clsx from 'clsx';
import './IconButton.css';
import * as Icons from '../../icons/index';
import Gradient from './Gradient.png';

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

const resolveIcon = (icon: IconButtonProps['icon']) => {
  if (typeof icon === 'string') return Icons[icon];
  return icon;
};

/* ----------------------------------
 * Component
 * ---------------------------------- */
export const IconButton: React.FC<IconButtonProps> = ({
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

  const wrapperClasses = clsx(
    'icon-button',
    `icon-button--${size}`,
    `icon-button--${tone}--${version}`,
    inverse && 'icon-button--inverse',
    disabled && 'icon-button--disabled',
    className
  );

  return (
    <Suspense fallback={null}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="frosted" primitiveUnits="objectBoundingBox">
          <feImage href={Gradient} x="0" y="0" width="1" height="1" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

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
    </Suspense>
  );
};

IconButton.displayName = 'IconButton';
export default memo(IconButton);

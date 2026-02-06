import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  href?: string;
  external?: boolean;
}

const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading,
  loadingText,
  fullWidth,
  href,
  external,
  className = '',
  disabled,
  type = 'button',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium 
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
    focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
  `;
  
  // Variant styles
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-cyan-600 text-white 
      hover:from-blue-500 hover:to-cyan-500 
      shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
      border-0
    `,
    secondary: `
      bg-slate-800 text-white 
      hover:bg-slate-700 
      border border-slate-700 hover:border-slate-600
      shadow-sm
    `,
    outline: `
      bg-transparent text-slate-300 
      hover:bg-slate-800 hover:text-white 
      border border-slate-600 hover:border-slate-500
    `,
    ghost: `
      bg-transparent text-slate-400 
      hover:text-white hover:bg-slate-800/60 
      border border-transparent
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-rose-600 text-white 
      hover:from-red-500 hover:to-rose-500 
      shadow-lg shadow-red-500/25 hover:shadow-red-500/40
      border-0
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white 
      hover:from-emerald-500 hover:to-teal-500 
      shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
      border-0
    `,
    link: `
      bg-transparent text-blue-400 
      hover:text-blue-300 hover:underline 
      border-0 shadow-none
      p-0 h-auto
    `
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg h-8',
    md: 'px-4 py-2.5 text-sm rounded-xl h-10',
    lg: 'px-6 py-3 text-base rounded-xl h-12',
    icon: 'p-2 rounded-lg h-10 w-10'
  };

  const combinedClassName = `
    ${baseStyles}
    ${variant !== 'link' ? sizes[size] : ''}
    ${variants[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Loading spinner
  const LoadingSpinner = () => (
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  );

  // Content
  const content = (
    <>
      {isLoading ? (
        <>
          <LoadingSpinner />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && size !== 'icon' && (
            <Icon className="w-4 h-4" aria-hidden="true" />
          )}
          {size === 'icon' && Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
          {size !== 'icon' && children}
          {Icon && iconPosition === 'right' && size !== 'icon' && (
            <Icon className="w-4 h-4" aria-hidden="true" />
          )}
        </>
      )}
    </>
  );

  // Render as anchor if href is provided
  if (href) {
    const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClassName}
        aria-disabled={disabled || isLoading}
        {...linkProps}
      >
        {content}
      </a>
    );
  }

  // Render as button
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

// Icon Button shorthand
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'size' | 'children'> {
  icon: LucideIcon;
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, label, ...props }) => (
  <Button
    {...props}
    icon={icon}
    size="icon"
    aria-label={label}
    title={label}
  >
    {null}
  </Button>
);

// Button Group
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  attached?: boolean;
}> = ({ children, className = '', attached = false }) => {
  if (attached) {
    return (
      <div className={`inline-flex ${className}`} role="group">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            className: `
              ${(child as React.ReactElement<ButtonProps>).props.className || ''}
              ${isFirst ? 'rounded-r-none' : 'rounded-l-none'}
              ${!isFirst ? '-ml-px' : ''}
            `.trim()
          });
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} role="group">
      {children}
    </div>
  );
};

export default Button;

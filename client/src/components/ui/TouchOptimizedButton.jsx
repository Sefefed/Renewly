import React from "react";

const TouchOptimizedButton = ({
  children,
  size = "normal",
  variant = "primary",
  isMobile = false,
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  const getSizeClasses = () => {
    const sizes = {
      small: "px-3 py-2 text-sm rounded-lg",
      normal: "px-4 py-3 text-base rounded-xl",
      large: "px-6 py-4 text-lg rounded-2xl",
      icon: "p-3 rounded-xl",
    };

    return sizes[size] || sizes.normal;
  };

  const getVariantClasses = () => {
    const variants = {
      primary: `
        bg-gradient-to-r from-blue-500 to-blue-600 
        hover:from-blue-600 hover:to-blue-700
        text-white shadow-lg hover:shadow-xl
        border border-blue-600
      `,
      secondary: `
        theme-aware-bg-tertiary
        theme-aware-text
        theme-aware-border
        border shadow-md hover:shadow-lg
        transition-colors
      `,
      ghost: `
        bg-transparent 
        hover:opacity-80
        theme-aware-text-secondary
        theme-aware-border
        border
      `,
      accent: `
        bg-gradient-to-r from-purple-500 to-purple-600 
        hover:from-purple-600 hover:to-purple-700
        text-white shadow-lg hover:shadow-xl
        border border-purple-600
      `,
    };

    return variants[variant] || variants.primary;
  };

  const getTouchClasses = () => {
    if (isMobile) {
      return "touch-manipulation active:scale-95";
    }
    return "hover:scale-105 active:scale-95";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
         font-body font-medium transition-all duration-200
         flex items-center justify-center gap-2
         ${getSizeClasses()}
         ${getVariantClasses()}
         ${getTouchClasses()}
         ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
         ${className}
       `}
      style={{
        minHeight: isMobile ? "44px" : "auto",
        minWidth: isMobile ? "44px" : "auto",
        touchAction: "manipulation",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default TouchOptimizedButton;

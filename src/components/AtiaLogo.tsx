import React from 'react';

interface AtiaLogoProps {
  className?: string;
  height?: number | string;
  primaryColor?: string;
  secondaryColor?: string;
  showText?: boolean;
}

export const AtiaLogo: React.FC<AtiaLogoProps> = ({
  className = "",
  height = 60,
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="https://static.tokkobroker.com/tfw_images/9795_Grupo%20Atia/LOGO_2024-02.png" 
        alt="ATIA"
        style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto' }}
        className="object-contain"
      />
    </div>
  );
};

export default AtiaLogo;

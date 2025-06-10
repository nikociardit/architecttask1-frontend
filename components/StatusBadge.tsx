import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

type StatusType = 
  | 'success' | 'error' | 'warning' | 'info' | 'pending' 
  | 'active' | 'inactive' | 'online' | 'offline' 
  | 'running' | 'completed' | 'failed' | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      success: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: CheckCircleIcon
      },
      error: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: XCircleIcon
      },
      warning: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: ExclamationTriangleIcon
      },
      info: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: ClockIcon
      },
      pending: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: ClockIcon
      },
      active: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: CheckCircleIcon
      },
      inactive: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: StopIcon
      },
      online: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: CheckCircleIcon
      },
      offline: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: XCircleIcon
      },
      running: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: PlayIcon
      },
      completed: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: CheckCircleIcon
      },
      failed: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: XCircleIcon
      },
      cancelled: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: StopIcon
      }
    };

    return configs[status] || configs.info;
  };

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'px-2.5 py-1 text-sm',
      icon: 'h-4 w-4'
    },
    lg: {
      badge: 'px-3 py-1.5 text-base',
      icon: 'h-5 w-5'
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full
      ${config.bgColor} ${config.textColor} 
      ${sizeClasses[size].badge}
      ${className}
    `}>
      {showIcon && (
        <Icon className={`${sizeClasses[size].icon} mr-1`} />
      )}
      {displayText}
    </span>
  );
};

export default StatusBadge;

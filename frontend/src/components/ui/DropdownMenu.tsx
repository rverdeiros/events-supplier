'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface DropdownMenuItem {
  label?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  divider?: boolean;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            className={cn(
              'absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1">
              {items.map((item, index) => {
                if (item.divider) {
                  return <div key={`divider-${index}`} className="border-t border-gray-200 my-1" />;
                }

                const content = (
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition-colors',
                      item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    onClick={() => handleItemClick(item)}
                    role="menuitem"
                  >
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    {item.label && <span>{item.label}</span>}
                  </div>
                );

                if (item.href) {
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="block"
                      onClick={() => handleItemClick(item)}
                    >
                      {content}
                    </Link>
                  );
                }

                return <div key={index}>{content}</div>;
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

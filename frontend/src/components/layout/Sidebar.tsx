'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  LayoutDashboard,
  User,
  FileText,
  Mail,
  Image,
  Settings,
  Shield,
  Users,
  Star,
  FolderTree,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Menu } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('supplier' | 'admin' | 'client')[];
}

const supplierNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['supplier'],
  },
  {
    label: 'Meu Perfil',
    href: '/dashboard/supplier/edit',
    icon: <User className="w-5 h-5" />,
    roles: ['supplier'],
  },
  {
    label: 'Formulário de Contato',
    href: '/dashboard/contact-form',
    icon: <FileText className="w-5 h-5" />,
    roles: ['supplier'],
  },
  {
    label: 'Submissões',
    href: '/dashboard/submissions',
    icon: <Mail className="w-5 h-5" />,
    roles: ['supplier'],
  },
  {
    label: 'Mídia',
    href: '/dashboard/media',
    icon: <Image className="w-5 h-5" />,
    roles: ['supplier'],
  },
];

const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Moderar Avaliações',
    href: '/admin/reviews',
    icon: <Star className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Categorias',
    href: '/admin/categories',
    icon: <FolderTree className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Usuários',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSupplier = user?.type === 'supplier';
  const isAdmin = user?.type === 'admin';

  const navItems = isAdmin ? adminNavItems : isSupplier ? supplierNavItems : [];

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          Menu
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 h-full transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:block',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed inset-y-0 left-0 z-50 w-64 pt-16 lg:pt-0',
          'lg:relative lg:z-auto'
        )}
      >
        <div className="h-full overflow-y-auto p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </aside>
    </>
  );
};

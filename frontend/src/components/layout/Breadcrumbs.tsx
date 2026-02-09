'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'supplier': 'Perfil',
  'supplier/edit': 'Editar Perfil',
  'supplier/create': 'Criar Perfil',
  'contact-form': 'Formulário de Contato',
  submissions: 'Submissões',
  media: 'Mídia',
  admin: 'Admin',
  reviews: 'Moderar Avaliações',
  categories: 'Categorias',
  users: 'Usuários',
};

// Map routes to actual hrefs (for routes that don't exist as separate pages)
const routeHrefs: Record<string, string> = {
  'supplier': '/dashboard/supplier/edit', // Map supplier to edit page
};

export const Breadcrumbs = () => {
  const pathname = usePathname();

  // Don't show breadcrumbs on home or auth pages
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Início', href: '/' },
  ];

  let currentPath = '';
  let skipNext = false;
  
  for (let index = 0; index < paths.length; index++) {
    // Skip this iteration if it was part of a compound route
    if (skipNext) {
      skipNext = false;
      continue;
    }
    
    const path = paths[index];
    currentPath += `/${path}`;
    
    // Check for compound routes first (e.g., 'supplier/edit')
    let label: string | undefined;
    let href = currentPath;
    
    if (index < paths.length - 1) {
      const nextPath = paths[index + 1];
      const compoundKey = `${path}/${nextPath}`;
      if (routeLabels[compoundKey]) {
        // This is a compound route, combine current and next path
        currentPath += `/${nextPath}`;
        label = routeLabels[compoundKey];
        href = currentPath;
        skipNext = true; // Skip the next iteration since we've processed it
        breadcrumbs.push({
          label,
          href,
        });
        continue;
      }
    }
    
    // If not a compound route, check for simple route
    label = routeLabels[path];
    // Use mapped href if available for simple routes
    if (routeHrefs[path]) {
      href = routeHrefs[path];
    }
    
    // Fallback to default label if not found
    if (!label) {
      label = path.charAt(0).toUpperCase() + path.slice(1);
    }
    
    breadcrumbs.push({
      label,
      href,
    });
  }

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={`${index}-${crumb.href}`} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  {isLast ? (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

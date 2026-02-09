'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Menu, X, User, LogOut, Settings, Building2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supplierService } from '@/lib/api/supplierService';
import { Supplier } from '@/types';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false);

  // Initialize auth state when component mounts - this ensures auth state is restored
  // from localStorage after page reload (e.g., after login redirect)
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load supplier data when user is a supplier
  useEffect(() => {
    const loadSupplier = async () => {
      if (isAuthenticated && user?.type === 'supplier' && !isLoadingSupplier) {
        setIsLoadingSupplier(true);
        try {
          const response = await supplierService.getMySupplier();
          setSupplier(response.data.supplier);
        } catch (error) {
          // Supplier not found or error - ignore silently
          // Reset supplier state if user is no longer a supplier or supplier was deleted
          setSupplier(null);
        } finally {
          setIsLoadingSupplier(false);
        }
      } else if (!isAuthenticated || user?.type !== 'supplier') {
        // Clear supplier data if user is not authenticated or not a supplier
        setSupplier(null);
      }
    };

    // Small delay to ensure state is updated before loading supplier
    const timeoutId = setTimeout(() => {
      loadSupplier();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.type, user?.id]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path;

  // Always show user name as primary display name
  const getDisplayName = () => {
    return user?.name || '';
  };

  // Menu items para o dropdown do usuário
  const getUserMenuItems = () => {
    const items = [];

    // Se o usuário é fornecedor, adiciona o nome do fornecedor como item no menu
    if (user?.type === 'supplier' && supplier) {
      const supplierName = supplier.fantasy_name || supplier.name;
      if (supplierName) {
        items.push({
          label: supplierName,
          icon: <Building2 className="w-4 h-4" />,
          href: '/dashboard/supplier/edit',
        });
        items.push({ divider: true });
      }
      items.push({
        label: 'Dashboard',
        icon: <Settings className="w-4 h-4" />,
        href: '/dashboard',
      });
    } 
    // Se o usuário não é fornecedor nem admin, adiciona opção para se tornar fornecedor
    else if (user?.type !== 'admin') {
      items.push({
        label: 'Cadastrar como Fornecedor',
        icon: <Building2 className="w-4 h-4" />,
        onClick: () => {
          router.push('/dashboard/supplier/create');
        },
      });
    }

    items.push(
      { divider: true },
      {
        label: 'Sair',
        icon: <LogOut className="w-4 h-4" />,
        onClick: handleLogout,
        danger: true,
      }
    );

    return items;
  };


  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Event Suppliers
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Início
            </Link>
            <Link
              href="/categorias"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/categorias') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Categorias
            </Link>

            {isAuthenticated ? (
              <>
                {user?.type === 'supplier' && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user?.type === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu
                  trigger={
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">
                        {getDisplayName()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  }
                  items={getUserMenuItems()}
                  align="right"
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/categorias"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/categorias') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Categorias
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.type === 'supplier' && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                    {getDisplayName()}
                  </div>
                  {user?.type === 'supplier' && supplier && (
                    <Link
                      href="/dashboard/supplier/edit"
                      className="px-3 py-2 text-sm text-blue-600 border-b border-gray-200 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      {supplier.fantasy_name || supplier.name}
                    </Link>
                  )}
                  {user?.type !== 'supplier' && user?.type !== 'admin' && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Meu Perfil
                    </Link>
                  )}
                  {user?.type !== 'supplier' && user?.type !== 'admin' && (
                    <Link
                      href="/dashboard/supplier/create"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cadastrar como Fornecedor
                    </Link>
                  )}
                  {user?.type === 'supplier' && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};


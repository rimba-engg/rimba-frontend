'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  FileText,
  Rocket,
  ClipboardCheck,
  Brain,
  ScrollText,
  UserCog,
  ChevronRight,
  Download,
  Upload,
  Library,
  BarChart3,
  Scale,
  Database,
  LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredCustomer } from '@/lib/auth';
import { type Customer } from '@/lib/types';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

interface MenuGroup {
  icon: any;
  label: string;
  items: MenuItem[];
}

const getMenuItems = (isAdmin: boolean, isRNGCustomer: boolean): (MenuItem | MenuGroup)[] => [
  { icon: Rocket, label: 'Onboarding', href: '/onboarding' },
  { icon: ClipboardCheck, label: 'Audit Manager', href: '/audit/projects' },
  ...(isAdmin ? [{ icon: UserCog, label: 'User Access', href: '/user-management' }] : []),
  ...(isRNGCustomer ? [] : [{
    icon: Library,
    label: 'Library',
    items: [
      { icon: FileText, label: 'Documents', href: '/library/documents' },
      { icon: FileText, label: 'Extractions', href: '/library/extractions' },
      { icon: Download, label: 'Incoming', href: '/library/incoming' },
      { icon: Upload, label: 'Outgoing', href: '/library/outgoing' },
    ],
  }]),
  {
    icon: BarChart3,
    label: 'Reporting',
    items: [
      { icon: Scale, label: 'Mass Balance', href: '/reporting/mass-balance' },
      ...(isRNGCustomer ? [] : [{ icon: Database, label: 'Storage Inventory', href: '/reporting/storage-inventory' }]),
      { icon: LineChart, label: 'Vertex', href: '/reporting/vertex' },
    ],
  },
  { icon: Brain, label: 'AI Extractor', href: '/ai-extractor' },
  { icon: ScrollText, label: 'RegsQA', href: '/regsqa' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Library');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const customer = getStoredCustomer();
    setCustomerData(customer);
  }, []);

  const isAdmin = customerData?.role === 'ADMIN';
  const isRNGCustomer = customerData?.is_rng_customer === 'true';
  const menuItems = getMenuItems(!!isAdmin, !!isRNGCustomer);

  const toggleGroup = (label: string) => {
    setExpandedGroup(current => current === label ? null : label);
  };

  const isItemActive = (href: string) => pathname === href;

  const renderMenuItem = (item: MenuItem | MenuGroup) => {
    if ('items' in item) {
      const isExpanded = expandedGroup === item.label;
      const isGroupActive = item.items.some(subItem => isItemActive(subItem.href));
      const Icon = item.icon;

      return (
        <div key={item.label}>
          <button
            onClick={() => toggleGroup(item.label)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md mb-1 text-gray-600 hover:bg-gray-100 transition-colors',
              isGroupActive && 'text-primary',
              collapsed ? 'justify-center' : ''
            )}
          >
            <Icon className="w-5 h-5" />
            {!collapsed && (
              <>
                <span>{item.label}</span>
                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'transform rotate-90'
                )} />
              </>
            )}
          </button>
          {isExpanded && !collapsed && (
            <div className="ml-4 space-y-1">
              {item.items.map(subItem => {
                const SubIcon = subItem.icon;
                const isActive = isItemActive(subItem.href);
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors',
                      isActive && 'text-primary bg-primary/5'
                    )}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span>{subItem.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const Icon = item.icon;
    const isActive = isItemActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md mb-1 text-gray-600 hover:bg-gray-100 transition-colors',
          isActive && 'text-primary bg-primary/5',
          collapsed ? 'justify-center' : ''
        )}
      >
        <Icon className="w-5 h-5" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        'h-screen bg-white border-r flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="p-2 flex items-center justify-between border-b">
        {!collapsed && (
          <p>{customerData?.name.toUpperCase()}</p>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className="p-2 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Rimba V{process.env.APP_VERSION}
        </p>
      </div>
    </div>
  );
}
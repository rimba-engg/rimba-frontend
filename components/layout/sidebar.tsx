'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu, DollarSign, FileText, House, Brain,
  FolderSearch2, UserCog, ChevronRight, Wind, Library,
  BarChart3, BarChart2, HandPlatter, Scale,
  Shield, Earth, Landmark, Calculator, CloudCog, Puzzle, Sheet, Book,
  Map, Calendar, Activity, Gauge, Fuel, BarChartHorizontal, Lock, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredCustomer } from '@/lib/auth';
import { type Customer } from '@/lib/types';
import { UnlockFeatureModal } from '@/components/ui/UnlockFeatureModal';
import { isFeatureRestricted } from '@/config/featureRestrictions';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  border?: boolean;
}

interface MenuGroup {
  icon: any;
  label: string;
  items: MenuItem[];
  border?: boolean;
}

// TODO: Clean up menu, a lotta crap
const getMenuItems = (isAdmin: boolean, customerData: Customer | null): (MenuItem | MenuGroup)[] => [
  { icon: House, label: 'Dashboard', href: '/dashboard' },
  { icon: Map, label: 'Projects', href: '/projects', },
  {
    icon: Library,
    label: 'Documents',
    items: [
      { icon: FolderSearch2, label: 'Finder', href: '/library/documents' }, 
      { icon: Sheet, label: 'Tables', href: '/library/extractions' },
      { icon: Brain, label: 'AI Extractor', href: '/ai-extractor'},
    ],
  },
  { icon: Scale, label: 'Methane Balance', href: '/reporting/rng-mass-balance', border: true },
  { icon: BarChart2, label: 'Balance Summary', href: '/reporting/analytics' },
  { icon: DollarSign, label: 'Factors of Revenue', href: '/reporting/factors-of-revenue' },
  { icon: Brain, label: 'Vertex', href: '/vertex' },
  { icon: Wind, label: 'Air Permits', href: '/reporting/air-permits' },
  { icon: ShieldCheck, label: 'Missing Data', href: '/reporting/missing-data' },
  { icon: Activity, label: 'Site Uptime', href: '/reporting/uptime' },
  { icon: Fuel, label: 'Gas Sales', href: '/reporting/gas-sales' },
  {
    icon: Landmark,
    label: 'RFS',
    items: [
      { icon: FileText, label: 'RFS QAP', href: '/reporting/rng-qap' },
    ],
    border: true,
  },
  {
    icon: Landmark,
    label: 'LCFS',
    items: [
      { icon: FileText, label: 'Data Substitution', href: '/reporting/data-substitution' },
      { icon: Calendar, label: 'Calendar', href: '/compliance/calendar' },
    ],
  },
  {
    icon: Landmark,
    label: 'IRS PW&A',
    items: [
      { icon: Gauge, label: 'Dashboard', href: '/prevailing-wage/dashboard' },
      { icon: FileText, label: 'Payroll Documents', href: '/prevailing-wage/payroll-documents' },
      { icon: BarChartHorizontal, label: 'Wage Tracker', href: '/prevailing-wage/wage-tracker' },
      { icon: Calculator, label: 'Underpayment Corrections', href: '/prevailing-wage/underpayment-corrections' },
      { icon: Brain, label: 'Apprenticeship', href: '/prevailing-wage/apprenticeship' },
      { icon: Activity, label: 'Labour Hour Log', href: '/prevailing-wage/labour-hour-log' },
      { icon: UserCog, label: 'Contractor Management', href: '/prevailing-wage/contractor-management' },
    ],
  },
  { icon: Landmark, label: 'SB-253',
    items: [
      { icon: FileText, label: 'Scope 2', href: '/reporting/emission-scope-2' },
    ],
  },
  {
    icon: HandPlatter,
    label: 'Services',
    items: [
      { icon: Calculator, label: 'Operational CI', href: '/reporting/ci-calculator' },
      { icon: CloudCog, label: 'CI Optimizer', href: '/ci_calculator' },
    ],
    border: true,
  },
  {
    icon: Book,
    label: 'Learning',
    items: [
      { icon: Landmark, label: 'Regulatory Credits', href: '/standards' },
      { icon: Earth, label: 'Voluntary Carbon', href: '/registries' },
    ],
  },
  ...(isAdmin ? [{ icon: UserCog, label: 'User Access', href: '/user-management'}] : []),
  ...(customerData?.role === 'SUPER_ADMIN' ? [{ icon: Shield, label: 'Superadmin Management', href: '/superadmin' }] : []),
  { icon: Puzzle, label: 'Integrations', href: '/integrations'},
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Library');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const pathname = usePathname();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');
  
  useEffect(() => {
    const customer = getStoredCustomer();
    setCustomerData(customer);
  }, []);

  const isAdmin = customerData?.role === 'ADMIN' || customerData?.role === 'SUPER_ADMIN';
  const menuItems = getMenuItems(isAdmin, customerData);

  const toggleGroup = (label: string) => {
    setExpandedGroup(current => current === label ? null : label);
  };

  const isItemActive = (href: string) => pathname === href;

  const handleRestrictedFeatureClick = (e: React.MouseEvent, isRestricted: boolean, featureName: string) => {
    if (isRestricted) {
      e.preventDefault();
      setLockedFeature(featureName);
      setShowUnlockModal(true);
    }
  };

  const renderMenuItem = (item: MenuItem | MenuGroup) => {
    if ('items' in item) {
      const isExpanded = expandedGroup === item.label;
      const isGroupActive = item.items.some(subItem => isItemActive(subItem.href));
      const Icon = item.icon;
      
      const isRestricted = isFeatureRestricted(item.label, customerData?.name);
      

      return (
        <div key={item.label}>
          <button
            onClick={(e) => {
              if (isRestricted) {
                handleRestrictedFeatureClick(e, true, item.label);
              } else {
                toggleGroup(item.label);
              }
            }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md mb-1 text-gray-600 hover:bg-gray-100 transition-colors text-base',
              isGroupActive && 'text-primary',
              collapsed ? 'justify-center' : '',
              item.border ? 'border-t' : '',
              isRestricted ? 'opacity-75' : ''
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <Icon className="w-4 h-4 min-w-[16px]" />
              {!collapsed && (
                <div className="flex flex-row items-center justify-between w-full">
                  <span className="mr-2">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {isRestricted && (
                      <Lock 
                        className="w-4 h-4 text-yellow-400" 
                        style={{ 
                          filter: 'drop-shadow(0 0 3px rgba(250, 204, 21, 0.5))',
                          strokeWidth: 2.5,
                          animation: 'pulse 2s infinite'
                        }} 
                      />
                    )}
                    <ChevronRight 
                      className={cn(
                        'w-4 h-4 transition-transform ml-1',
                        isExpanded && 'transform rotate-90'
                      )} 
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
          {isExpanded && !collapsed && !isRestricted && (
            <div className="ml-4 space-y-1">
              {item.items.map(subItem => {
                const SubIcon = subItem.icon;
                const isActive = isItemActive(subItem.href);
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={(e) => handleRestrictedFeatureClick(e, isRestricted, item.label)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors',
                      isActive && 'text-primary bg-primary/5',
                      isRestricted && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span className="text-base">{subItem.label}</span>
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
          'flex items-center gap-2 px-3 py-2 mb-1 text-gray-600 hover:bg-gray-100 transition-colors text-base',
          isActive && 'text-primary bg-primary/5',
          collapsed ? 'justify-center' : '',
          item.border ? 'border-t' : ''
        )}
      >
        <Icon className="w-4 h-4" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const getLogo = () => {
    if (!collapsed) 
      return <a href="/">
        <img src="https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/vertex-assets//logo-with-text-white.jpg" alt="Rimba Logo" className="h-8" />
      </a>;
  };

  return (
    <>
      <div
        className={cn(
          'h-screen bg-white border-r flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-52'
        )}
      >
        <div className="p-2 flex items-center justify-between border-b">
          {getLogo()}
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
      
      <UnlockFeatureModal 
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        featureName={lockedFeature}
      />
    </>
  );
}

<style jsx global>{`
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`}</style>
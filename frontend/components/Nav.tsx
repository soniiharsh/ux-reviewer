'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Activity } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Analyze', icon: Scan },
  { href: '/history', label: 'History', icon: History },
  { href: '/status', label: 'Status', icon: Activity },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-brand-600 flex items-center gap-2">
          <Scan size={20} />
          UX Reviewer
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

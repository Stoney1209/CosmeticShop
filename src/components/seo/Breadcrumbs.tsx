import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [
    { label: "Inicio", href: "/tienda" },
    ...items
  ];

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm text-slate-600 ${className}`}>
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <li>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </li>
            )}
            <li className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-pink-600 transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

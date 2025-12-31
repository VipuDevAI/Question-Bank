import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  children: ReactNode;
  className?: string;
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header className={cn("bg-card text-card-foreground border-b border-card-border shadow-sm", className)}>
      {children}
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <main className={cn("p-6 flex-1", className)}>
      {children}
    </main>
  );
}

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function ContentCard({ children, className, title, description, actions }: ContentCardProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-xl shadow-lg p-6", className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface GridContainerProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

export function GridContainer({ children, className, cols = 3 }: GridContainerProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", colClasses[cols], className)}>
      {children}
    </div>
  );
}

export function PageFooter() {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground border-t border-card-border bg-card mt-auto">
      Powered by <strong>SmartGenEduX</strong> 2025
    </footer>
  );
}

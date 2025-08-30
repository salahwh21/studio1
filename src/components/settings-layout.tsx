
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SettingsLayoutProps {
  title: string;
  description: string;
  backHref: string;
  children: React.ReactNode;
}

export function SettingsLayout({ title, description, backHref, children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {/* Content */}
      <main>
        {children}
      </main>
    </div>
  );
}

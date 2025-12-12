'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsLayoutProps {
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor?: string;
    children: ReactNode;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}

export function SettingsLayout({
    title,
    description,
    icon: Icon,
    iconColor = 'text-primary',
    children,
    actions,
    breadcrumbs = [],
}: SettingsLayoutProps) {
    const defaultBreadcrumbs = [
        { label: 'لوحة التحكم', href: '/dashboard' },
        { label: 'الإعدادات', href: '/dashboard/settings' },
        ...breadcrumbs,
        { label: title },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    {defaultBreadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronLeft className="h-4 w-4" />}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="hover:text-primary transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-background/80 backdrop-blur shadow-sm`}>
                                <Icon className={`h-7 w-7 ${iconColor}`} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{title}</h1>
                                <p className="text-muted-foreground mt-0.5">{description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {actions}
                            <Link href="/dashboard/settings">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    رجوع
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Reusable Settings Card
interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function SettingsCard({ title, description, children, actions, className = '' }: SettingsCardProps) {
    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && (
                            <CardDescription className="mt-1">{description}</CardDescription>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {children}
            </CardContent>
        </Card>
    );
}

// Reusable Settings Section (for grouping within a page)
interface SettingsSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

// Reusable Settings Row (for label + control)
interface SettingsRowProps {
    label: string;
    description?: string;
    children: ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b last:border-0">
            <div className="space-y-0.5">
                <label className="text-sm font-medium">{label}</label>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

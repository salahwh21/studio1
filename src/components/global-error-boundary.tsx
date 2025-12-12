'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
      // errorTrackingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <Card className="max-w-lg w-full border-2 border-red-300 dark:border-red-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                <div>
                  <CardTitle className="text-2xl">حدث خطأ غير متوقع</CardTitle>
                  <CardDescription className="mt-1">
                    عذراً، حدث خطأ أثناء تشغيل التطبيق. يرجى المحاولة مرة أخرى.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  تفاصيل الخطأ:
                </p>
                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-words">
                  {this.state.error?.message || 'خطأ غير معروف'}
                </p>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <summary className="cursor-pointer text-sm font-semibold mb-2">
                    معلومات إضافية (Development Only)
                  </summary>
                  <pre className="text-xs overflow-auto max-h-40 font-mono text-slate-700 dark:text-slate-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={this.handleReset} 
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                إعادة تحميل الصفحة
              </Button>
              <Button 
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  العودة للصفحة الرئيسية
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}



'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a redirect component.
// It will immediately try to redirect to the correct integration settings page.
export default function ConnectIntegrationPage() {
    const params = useParams();
    const router = useRouter();
    const { integrationId } = params;

    useEffect(() => {
        if (integrationId) {
            // Immediately redirect to the main settings page for this integration
            router.replace(`/dashboard/settings/integrations/${integrationId}`);
        } else {
            // Fallback if no ID is present
            router.replace('/dashboard/settings/integrations');
        }
    }, [integrationId, router]);

    // Render nothing, or a loading skeleton, while redirecting
    return null;
}

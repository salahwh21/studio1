
'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from '@/components/icon';

export default function AiAgentPage() {
    // This page is a placeholder for now.
    // We will add the UI to interact with the new AI flow here later.
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Icon name="Bot" />
                        The AI Agent
                    </CardTitle>
                    <CardDescription>
                        Under construction. This is where you will be able to build and customize AI-powered tasks.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

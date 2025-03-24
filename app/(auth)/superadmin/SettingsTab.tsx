'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure global system settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Environment</h3>
            <p className="text-sm text-muted-foreground">Production</p>
          </div>
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Version</h3>
            <p className="text-sm text-muted-foreground">{process.env.APP_VERSION || '1.0.0'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
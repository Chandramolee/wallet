
"use client"

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AccountSettingsPage() {
    const { user, isLoaded } = useUser();
    const [reportSettings, setReportSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/reports/settings');
                const data = await res.json();
                setReportSettings(data);
            } catch (error) {
                toast.error('Failed to load report settings');
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            fetchSettings();
        }
    }, [isLoaded, user]);

    const handleUpdateSettings = async (updates: any) => {
        try {
            const res = await fetch('/api/reports/settings', {
                method: 'PUT',
                body: JSON.stringify({ ...reportSettings, ...updates }),
            });
            const data = await res.json();
            setReportSettings(data);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and communication preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your basic account details from Clerk.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="p-2 bg-secondary rounded-md text-sm">{user?.fullName}</div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="p-2 bg-secondary rounded-md text-sm">{user?.primaryEmailAddress?.emailAddress}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>Configure how and when you receive AI-generated financial insights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Monthly Reports</Label>
                            <p className="text-sm text-muted-foreground">Receive a detailed summary of your spending via email.</p>
                        </div>
                        <Switch
                            checked={reportSettings?.isEnabled}
                            onCheckedChange={(checked) => handleUpdateSettings({ isEnabled: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Report Frequency</Label>
                        <Select
                            value={reportSettings?.frequency}
                            onValueChange={(val) => handleUpdateSettings({ frequency: val })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="WEEKLY">Weekly (Coming Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

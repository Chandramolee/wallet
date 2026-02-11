
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BillingSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription plan and billing details.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Current Plan
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                        </Badge>
                    </CardTitle>
                    <CardDescription>You are currently on the Pro Annual plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Next billing date</p>
                            <p className="text-2xl font-bold">December 24, 2026</p>
                            <p className="text-sm text-muted-foreground">₹4,999 / year</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Plan Features:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                "Unlimited bank accounts",
                                "AI-powered financial insights",
                                "Monthly automated reports",
                                "Priority support",
                                "Custom categories",
                                "Detailed export options"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-secondary/20 pt-6 border-t border-border">
                    <Button variant="outline">Downgrade Plan</Button>
                    <Button>Manage Billing (Stripe)</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>View and download your previous invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground italic">
                        No previous invoices found.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

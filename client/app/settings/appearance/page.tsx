
"use client"

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Monitor } from "lucide-react";

export default function AppearanceSettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Appearance</h1>
                <p className="text-muted-foreground">Customize how Finora looks on your screen.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Select the theme for the application interface.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={theme}
                        onValueChange={setTheme}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="light" id="light" className="peer sr-only" />
                            <Label
                                htmlFor="light"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Sun className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Light</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                            <Label
                                htmlFor="dark"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Moon className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Dark</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="system" id="system" className="peer sr-only" />
                            <Label
                                htmlFor="system"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Monitor className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">System</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}

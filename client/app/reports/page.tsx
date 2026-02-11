
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface Report {
    _id: string;
    period: string;
    sentDate: string;
    status: string;
    createdAt: string;
}

import { Navbar } from '@/components/Navbar';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(); // Start of last month
            const to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString(); // End of last month

            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from, to }),
            });

            if (res.ok) {
                // Refresh list
                fetchReports();
            } else {
                console.error('Failed to generate report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground">Monthly Reports</h2>
                        <p className="text-muted-foreground">AI-generated summaries of your financial health</p>
                    </div>
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate New Report'}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="border-border">
                                <CardContent className="p-5">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-8 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : reports.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No reports generated yet.
                        </div>
                    ) : (
                        reports.map((report) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-border hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-base font-medium">
                                            {report.period}
                                        </CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Generated on {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Report
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

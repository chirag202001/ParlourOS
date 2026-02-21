'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp, Users, DollarSign, Download, BarChart3, Percent,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ReportsClient({
  revenueReport,
  serviceMix,
  staffPerformance,
  retention,
  gstSummary,
}: {
  revenueReport: any;
  serviceMix: any[];
  staffPerformance: any[];
  retention: any;
  gstSummary: any;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Revenue, performance &amp; analytics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueReport.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{revenueReport.totalInvoices} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Ticket</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueReport.avgTicket)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retention.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">{retention.retentionRate}% retention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GST Collected</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(gstSummary.totalTax)}</div>
            <p className="text-xs text-muted-foreground">CGST + SGST</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Service Mix</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="gst">GST Summary</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{formatCurrency(revenueReport.totalRevenue)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tax Collected</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{formatCurrency(revenueReport.totalTax)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Discounts Given</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold text-orange-600">{formatCurrency(revenueReport.totalDiscount)}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueReport.dailyBreakdown.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">No data for this period</TableCell>
                      </TableRow>
                    ) : (
                      revenueReport.dailyBreakdown.map((d: any) => (
                        <TableRow key={d.date}>
                          <TableCell>{d.date}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(d.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Mix Tab */}
        <TabsContent value="services" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">% Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceMix.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No data yet</TableCell>
                  </TableRow>
                ) : (
                  (() => {
                    const totalRev = serviceMix.reduce((s, i) => s + i.revenue, 0);
                    return serviceMix.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                        <TableCell className="text-right">{s.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.revenue)}</TableCell>
                        <TableCell className="text-right">
                          {totalRev > 0 ? Math.round((s.revenue / totalRev) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ));
                  })()
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Staff Performance Tab */}
        <TabsContent value="staff" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead className="text-right">Appointments</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No data yet</TableCell>
                  </TableRow>
                ) : (
                  staffPerformance.map((s, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{s.appointments}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{retention.totalCustomers}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Active (30d)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{retention.activeCustomers}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-600">At Risk (30-60d)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-600">{retention.atRiskCustomers}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">Lapsed (60d+)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{retention.lapsedCustomers}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600">New This Month</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{retention.newThisMonth}</div></CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                  <p className="text-4xl font-bold">{retention.retentionRate}%</p>
                </div>
                <div className="h-24 w-24 rounded-full border-8 border-primary flex items-center justify-center">
                  <span className="text-xl font-bold">{retention.retentionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Tab */}
        <TabsContent value="gst" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Summary — Current Month</CardTitle>
              <CardDescription>Based on {gstSummary.invoiceCount} paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Taxable Value</TableCell>
                      <TableCell className="text-right">{formatCurrency(gstSummary.totalTaxableValue)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CGST (9%)</TableCell>
                      <TableCell className="text-right">{formatCurrency(gstSummary.cgst)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SGST (9%)</TableCell>
                      <TableCell className="text-right">{formatCurrency(gstSummary.sgst)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total Tax</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(gstSummary.totalTax)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Grand Total (incl. tax)</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(gstSummary.totalValue)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

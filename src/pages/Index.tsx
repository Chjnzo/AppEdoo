"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, ArrowUpRight } from 'lucide-react';

const Index = () => {
  const recentActivity = [
    { id: 1, user: "Alex Rivera", action: "Updated Project Alpha", time: "2m ago", status: "Success" },
    { id: 2, user: "Sarah Chen", action: "Created new invoice", time: "15m ago", status: "Pending" },
    { id: 3, user: "Mike Johnson", action: "Deleted old assets", time: "1h ago", status: "Warning" },
    { id: 4, user: "Elena Gilbert", action: "Added 5 team members", time: "3h ago", status: "Success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl font-bold">$45,231.89</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-emerald-500 font-medium">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +20.1% from last month
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-2xl font-bold">+2,350</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-emerald-500 font-medium">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +180.1% from last month
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2">
              <CardDescription>Active Projects</CardDescription>
              <CardTitle className="text-2xl font-bold">12</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground font-medium">
                Currently in progress
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A list of recent actions across your workspace.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="font-medium pl-6">{item.user}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Success' ? 'default' : item.status === 'Warning' ? 'destructive' : 'secondary'} className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-muted-foreground">{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { INITIAL_HEALTH_RECORD, INITIAL_PRESCRIPTIONS, INITIAL_DIAGNOSTIC_ORDERS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import {
  FileText,
  Activity,
  Pill,
  FlaskConical,
  GitBranch,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const HealthRecordView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'PRESCRIPTIONS' | 'DIAGNOSTICS'>('TIMELINE');
  const [expandedId, setExpandedId] = useState<string | null>('tl_01');

  const record = INITIAL_HEALTH_RECORD;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Longitudinal Electronic Health Record (EHR)"
        subtitle="Complete medical history, vital signs telemetry, digital prescriptions, and diagnostic lab reports."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Health Record' }]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-4 w-4" />
            <span>Export ABHA Health Summary</span>
          </Button>
        }
      />

      {/* Patient Summary Header */}
      <Card className="p-5 border-teal-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{record.name}</h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                ABHA: {record.abhaId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Age: {record.age} Yrs • Gender: {record.gender} • Blood Group: <strong>{record.bloodGroup}</strong> • Phone: +91 {record.phone}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chronic Conditions</span>
              <span className="font-semibold text-slate-800">{record.chronicConditions?.join(', ')}</span>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-900">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Known Allergies</span>
              <span className="font-semibold">{record.allergies?.join(', ')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Switcher */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'TIMELINE' | 'PRESCRIPTIONS' | 'DIAGNOSTICS')}>
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="TIMELINE" icon={<Activity className="h-4 w-4" />}>
            Timeline Feed
          </TabsTrigger>
          <TabsTrigger value="PRESCRIPTIONS" icon={<Pill className="h-4 w-4" />}>
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="DIAGNOSTICS" icon={<FlaskConical className="h-4 w-4" />}>
            Diagnostics
          </TabsTrigger>
        </TabsList>

        {/* 1. TIMELINE FEED */}
        <TabsContent value="TIMELINE" className="space-y-4 pt-2">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-200 space-y-6">
            {record.timeline.map((event) => {
              const isExpanded = expandedId === event.id;
              return (
                <div key={event.id} className="relative">
                  {/* Circle marker */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-white shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <Card className="hover:border-teal-300 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => toggleExpand(event.id)}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                              {event.eventType}
                            </span>
                            <span className="text-xs text-slate-400">{formatDate(event.date)}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{event.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {event.facilityName} {event.doctorName ? `• ${event.doctorName}` : ''}
                          </p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed border border-slate-100">
                        {event.summary}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* 2. PRESCRIPTIONS */}
        <TabsContent value="PRESCRIPTIONS" className="space-y-4 pt-2">
          {INITIAL_PRESCRIPTIONS.map((rx) => (
            <Card key={rx.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">{rx.diagnosisSummary}</CardTitle>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Issued by {rx.doctorName} • {rx.facilityName} • {formatDate(rx.issuedAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-4 w-4" />
                  PDF Prescription
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Pharmacy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                          <td className="p-2.5 text-slate-600">{item.dosage}</td>
                          <td className="p-2.5 text-slate-600">{item.frequency}</td>
                          <td className="p-2.5 text-slate-600">{item.duration}</td>
                          <td className="p-2.5">
                            <StatusBadge status={item.dispensedStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 3. DIAGNOSTICS */}
        <TabsContent value="DIAGNOSTICS" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_DIAGNOSTIC_ORDERS.map((order) => (
              <Card key={order.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {order.testCategory}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{order.testName}</h3>
                    <p className="text-xs text-slate-500">
                      Ordered by {order.orderedBy} on {formatDate(order.orderedAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {order.resultSummary && (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block">Laboratory Finding:</span>
                    <p className="font-mono text-slate-800 font-semibold">{order.resultSummary}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Download className="h-4 w-4" />
                    Download Lab Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

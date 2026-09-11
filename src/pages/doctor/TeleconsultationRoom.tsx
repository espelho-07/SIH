import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { INITIAL_HEALTH_RECORD } from '@/mock/mockData';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Wifi,
  FileText,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const TeleconsultationRoom: React.FC = () => {
  const patient = INITIAL_HEALTH_RECORD;

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [notes, setNotes] = useState('Advised continuing Telmisartan 40mg. Follow-up ECG in 2 weeks.');
  const [showMobileChart, setShowMobileChart] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="National Teleconsultation Suite (HealthConnect Grid)"
        subtitle="Encrypted WebRTC consultation room with clinical EHR timeline and live prescription tools."
        breadcrumbs={[{ label: 'Doctor Dashboard', to: '/doctor' }, { label: 'Teleconsultation' }]}
        actions={
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            <span>Connection: HD 1080p (Latency: 28ms)</span>
          </div>
        }
      />

      {callEnded ? (
        <Card className="p-8 text-center bg-white border-slate-200 space-y-4 max-w-lg mx-auto shadow-md">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
            <PhoneOff className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Teleconsultation Concluded</h2>
          <p className="text-xs text-slate-500">
            Encounter duration: 12 mins 45 secs. Summary saved to citizen's longitudinal health record.
          </p>
          <div className="pt-2">
            <Button onClick={() => setCallEnded(false)} variant="primary" className="bg-teal-700">
              Re-enter Consultation Room
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Video Area (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
              {/* Simulated Patient Video Stream */}
              {cameraOn ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900">
                  <div className="text-center space-y-2">
                    <div className="h-24 w-24 rounded-full bg-teal-800 text-white flex items-center justify-center mx-auto text-2xl font-bold border-4 border-teal-500/50">
                      RS
                    </div>
                    <p className="text-white font-bold text-sm">Rameshwar Sharma (Patient)</p>
                    <p className="text-slate-400 text-xs">Pethapur PHC Tele-clinic Kiosk</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <VideoOff className="h-8 w-8 text-slate-500" />
                  <span>Video Paused</span>
                </div>
              )}

              {/* Doctor's Self-View PIP */}
              <div className="absolute top-4 right-4 h-28 w-40 rounded-xl bg-slate-800 border-2 border-white/40 overflow-hidden shadow-lg flex items-center justify-center text-white text-xs">
                <div className="text-center">
                  <p className="font-semibold text-[11px]">Dr. Arvind Patel</p>
                  <span className="text-[9px] text-teal-400">Self View (OPD 4)</span>
                </div>
              </div>

              {/* Overlay Patient Name Tag */}
              <div className="absolute bottom-4 left-4 rounded-lg bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 text-xs text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Rameshwar Sharma (48Y / M) • ABHA: 14-8921-3409</span>
              </div>
            </div>

            {/* Video Control Bar */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <Button
                onClick={() => setMicOn(!micOn)}
                variant={micOn ? 'secondary' : 'destructive'}
                size="icon"
                className="rounded-full min-h-[44px] min-w-[44px]"
                aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micOn ? <Mic className="h-5 w-5 text-slate-700" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                onClick={() => setCameraOn(!cameraOn)}
                variant={cameraOn ? 'secondary' : 'destructive'}
                size="icon"
                className="rounded-full min-h-[44px] min-w-[44px]"
                aria-label={cameraOn ? 'Stop camera' : 'Start camera'}
              >
                {cameraOn ? <Video className="h-5 w-5 text-slate-700" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                onClick={() => setScreenSharing(!screenSharing)}
                variant={screenSharing ? 'primary' : 'secondary'}
                size="icon"
                className="rounded-full min-h-[44px] min-w-[44px]"
                aria-label="Toggle screen sharing"
              >
                <MonitorUp className="h-5 w-5" />
              </Button>

              <Button
                onClick={() => setCallEnded(true)}
                variant="destructive"
                className="rounded-full px-5 min-h-[44px] gap-2 font-bold"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Call</span>
              </Button>

              {/* Mobile chart button */}
              <Button
                onClick={() => setShowMobileChart(true)}
                variant="outline"
                size="sm"
                className="md:hidden text-xs gap-1"
              >
                <FileText className="h-4 w-4" />
                <span>Chart</span>
              </Button>
            </div>
          </div>

          {/* Desktop Right Side: Integrated Clinical Notes & Vitals (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-slate-900 uppercase text-[11px]">Patient EHR Summary</span>
                  <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    B+ Blood
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Known Conditions:</span>
                  <p className="font-semibold text-slate-800">{patient.chronicConditions?.join(', ')}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Recent Vitals:</span>
                  <p className="font-bold text-slate-900">BP: 128/82 mmHg • Pulse: 74 bpm • Sugar: 148 mg/dL</p>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  <span className="font-bold text-slate-800 block uppercase text-[10px]">
                    Live Teleconsultation Notes
                  </span>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    placeholder="Document clinical diagnosis and treatment plan..."
                  />
                </div>

                <Button variant="primary" size="sm" className="w-full bg-teal-700 text-xs">
                  Save Notes to EHR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mobile Chart Bottom Sheet */}
      <BottomSheet open={showMobileChart} onOpenChange={setShowMobileChart} title="Patient Clinical Chart">
        <div className="space-y-3 text-xs">
          <p className="font-bold text-slate-900">{patient.name} ({patient.age}Y / {patient.gender})</p>
          <p className="text-slate-500">Conditions: {patient.chronicConditions?.join(', ')}</p>
          <div className="pt-2">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border p-2 text-xs"
              placeholder="Clinical notes..."
            />
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

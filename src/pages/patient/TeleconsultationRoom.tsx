import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  CheckCircle2,
  History,
  Stethoscope,
  Hospital,
} from 'lucide-react';

export const TeleconsultationRoom: React.FC = () => {
  const navigate = useNavigate();
  const patient = INITIAL_HEALTH_RECORD;

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [showMobileChart, setShowMobileChart] = useState(false);

  const [notes, setNotes] = useState(
    'Advised continuing Telmisartan 40mg. Follow-up ECG in 2 weeks.'
  );

  /*
   * End consultation and save it into communication history
   */
  const handleEndCall = () => {
    const now = new Date();

    const consultation = {
      id: `CONS-${Date.now()}`,
      patientName: patient.name,
      abhaId: patient.abhaId,
      doctorName: 'Dr. Arvind Patel',
      hospitalName: 'Gandhinagar Civil Hospital',
      date: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: '12 mins 45 secs',
      status: 'Completed',
      notes: notes || 'No consultation notes added.',
      advice:
        'Continue prescribed medicines and follow the doctor’s instructions.',
      followUp: 'Follow-up ECG in 2 weeks.',
    };

    const existingHistory = JSON.parse(
      localStorage.getItem('teleconsultation_history') || '[]'
    );

    localStorage.setItem(
      'teleconsultation_history',
      JSON.stringify([consultation, ...existingHistory])
    );

    setCallEnded(true);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ================================
          PAGE HEADER
      ================================= */}

      <PageHeader
        title="Teleconsultation"
        subtitle="Talk to a doctor online from your home or nearby health centre."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Teleconsultation' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/teleconsultation-history')}
            className="gap-1.5 text-xs"
          >
            <History className="h-4 w-4" />
            Communication History
          </Button>
        }
      />

      {/* ================================
          CALL ENDED
      ================================= */}

      {callEnded ? (
        <Card className="border-emerald-200 bg-white shadow-md">
          <CardContent className="p-8 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-700" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Teleconsultation Completed
            </h2>

            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Your consultation has ended successfully. The consultation
              information has been saved to your communication history.
            </p>

            <div className="mx-auto mt-5 grid max-w-lg grid-cols-2 gap-3 text-left">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Doctor
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  Dr. Arvind Patel
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Duration
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  12 mins 45 secs
                </p>
              </div>

            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2">

              <Button
                onClick={() =>
                  navigate('/patient/teleconsultation-history')
                }
                className="bg-teal-700 hover:bg-teal-800 gap-2"
              >
                <History className="h-4 w-4" />
                View Communication History
              </Button>

              <Button
                variant="outline"
                onClick={() => setCallEnded(false)}
              >
                Re-enter Consultation
              </Button>

            </div>
          </CardContent>
        </Card>
      ) : (

        /* ================================
           ACTIVE CALL
        ================================= */

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* ================================
              VIDEO
          ================================= */}

          <div className="lg:col-span-8 space-y-3">

            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-lg">

              {cameraOn ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900">

                  <div className="text-center">

                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-800 text-2xl font-bold text-white border-4 border-teal-500/40">
                      RS
                    </div>

                    <p className="mt-3 text-sm font-bold text-white">
                      {patient.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Patient • Connected
                    </p>

                  </div>

                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">

                  <div className="text-center">

                    <VideoOff className="mx-auto h-8 w-8 mb-2" />

                    <p className="text-xs">
                      Your camera is turned off
                    </p>

                  </div>

                </div>
              )}

              {/* Self View */}

              <div className="absolute right-4 top-4 h-24 w-36 rounded-xl border-2 border-white/40 bg-slate-800 flex items-center justify-center text-white shadow-lg">

                <div className="text-center">

                  <p className="text-[11px] font-semibold">
                    You
                  </p>

                  <p className="text-[9px] text-teal-400">
                    Self View
                  </p>

                </div>

              </div>

              {/* Connection */}

              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-[10px] font-semibold text-white">

                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

                <Wifi className="h-3 w-3 text-emerald-400" />

                Connected

              </div>

              {/* Patient info */}

              <div className="absolute bottom-4 left-4 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-white">

                {patient.name} • ABHA Linked

              </div>

            </div>

            {/* ================================
                CONTROLS
            ================================= */}

            <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

              <Button
                onClick={() => setMicOn(!micOn)}
                variant={micOn ? 'secondary' : 'destructive'}
                size="icon"
                className="rounded-full h-11 w-11"
              >
                {micOn ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>

              <Button
                onClick={() => setCameraOn(!cameraOn)}
                variant={cameraOn ? 'secondary' : 'destructive'}
                size="icon"
                className="rounded-full h-11 w-11"
              >
                {cameraOn ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>

              <Button
                onClick={() => setScreenSharing(!screenSharing)}
                variant={screenSharing ? 'primary' : 'secondary'}
                size="icon"
                className="rounded-full h-11 w-11"
              >
                <MonitorUp className="h-5 w-5" />
              </Button>

              <Button
                onClick={handleEndCall}
                variant="destructive"
                className="rounded-full min-h-[44px] px-5 gap-2 font-bold"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>

              <Button
                onClick={() => setShowMobileChart(true)}
                variant="outline"
                size="sm"
                className="lg:hidden gap-1"
              >
                <FileText className="h-4 w-4" />
                Chart
              </Button>

            </div>

            {/* History shortcut */}

            <Button
              onClick={() =>
                navigate('/patient/teleconsultation-history')
              }
              variant="outline"
              className="w-full gap-2"
            >
              <History className="h-4 w-4" />
              View Previous Consultation History
            </Button>

          </div>

          {/* ================================
              PATIENT INFORMATION
          ================================= */}

          <div className="hidden lg:block lg:col-span-4">

            <Card className="border-slate-200 shadow-sm">

              <CardContent className="p-4 space-y-4">

                <div className="flex items-center justify-between border-b pb-3">

                  <div>

                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Consultation
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">
                      Doctor Connected
                    </h3>

                  </div>

                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    Live
                  </span>

                </div>

                <div className="space-y-3 text-xs">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                      <Stethoscope className="h-4 w-4 text-teal-700" />
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Doctor
                      </p>
                      <p className="font-bold text-slate-800">
                        Dr. Arvind Patel
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Hospital className="h-4 w-4 text-slate-600" />
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Hospital
                      </p>
                      <p className="font-bold text-slate-800">
                        Gandhinagar Civil Hospital
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Consultation
                      </p>
                      <p className="font-bold text-slate-800">
                        General Medicine
                      </p>
                    </div>

                  </div>

                </div>

                <div className="border-t pt-3">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Consultation Notes
                  </p>

                  <textarea
                    rows={5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Doctor consultation notes..."
                  />

                  <p className="mt-1 text-[10px] text-slate-400">
                    Notes will be saved when the call ends.
                  </p>

                </div>

              </CardContent>

            </Card>

          </div>

        </div>
      )}

      {/* ================================
          MOBILE CHART
      ================================= */}

      <BottomSheet
        open={showMobileChart}
        onOpenChange={setShowMobileChart}
        title="Consultation Information"
      >

        <div className="space-y-4 text-xs">

          <div>
            <p className="text-slate-400">
              Doctor
            </p>

            <p className="font-bold text-slate-900">
              Dr. Arvind Patel
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Hospital
            </p>

            <p className="font-bold text-slate-900">
              Gandhinagar Civil Hospital
            </p>
          </div>

          <div>

            <p className="text-slate-400">
              Consultation Notes
            </p>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
            />

          </div>

        </div>

      </BottomSheet>
    </div>
  );
};

export default TeleconsultationRoom;
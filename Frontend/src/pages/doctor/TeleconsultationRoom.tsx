import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MonitorUp,
  Clock3,
  User,
  PhoneIncoming,
  ShieldCheck,
  CircleCheck,
  X,
  Stethoscope,
} from 'lucide-react';

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
  status: 'CALLING' | 'WAITING' | 'COMPLETED';
};

const PATIENTS: Patient[] = [
  {
    id: 'p001',
    name: 'Rameshwar Sharma',
    age: 48,
    gender: 'Male',
    reason: 'General Consultation',
    status: 'CALLING',
  },
  {
    id: 'p002',
    name: 'Priya Patel',
    age: 35,
    gender: 'Female',
    reason: 'Follow-up Consultation',
    status: 'WAITING',
  },
  {
    id: 'p003',
    name: 'Amit Shah',
    age: 52,
    gender: 'Male',
    reason: 'Health Check-up',
    status: 'WAITING',
  },
];

export const TeleconsultationRoom: React.FC = () => {
  const [incomingCall, setIncomingCall] = useState(true);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const patient = PATIENTS[0];

  const handleAccept = () => {
    setIncomingCall(false);
    setCallAccepted(true);
    setCallRejected(false);
  };

  const handleReject = () => {
    setIncomingCall(false);
    setCallAccepted(false);
    setCallRejected(true);
  };

  const handleBackToCalls = () => {
    setIncomingCall(true);
    setCallRejected(false);
    setCallAccepted(false);
  };

  const handleEndCall = () => {
    setCallAccepted(false);
    setIncomingCall(false);
    setCallRejected(true);
  };

  /* =========================================================
     INCOMING CALL
  ========================================================== */

  if (incomingCall) {
    return (
      <div className="space-y-5">

        <div className="[&_h1]:text-xl [&_h1]:sm:text-2xl [&_p]:text-xs [&_p]:sm:text-sm">
          <PageHeader
            title="Teleconsultation"
            subtitle="Receive and manage online consultations from your patients."
            breadcrumbs={[
              { label: 'Doctor Dashboard', to: '/doctor' },
              { label: 'Teleconsultation' },
            ]}
          />
        </div>

        {/* Incoming Call Card */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 sm:p-6">

            <div className="flex flex-col items-center text-center">

              {/* Incoming Icon */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                  <PhoneIncoming className="h-7 w-7 text-teal-700" />
                </div>

                <span className="absolute right-1 top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Incoming Consultation
              </p>

              <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                {patient.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {patient.age}Y • {patient.gender}
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-700">
                  {patient.reason}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Patient is requesting a video consultation
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">

                <Button
                  onClick={handleReject}
                  variant="outline"
                  size="md"
                  className="flex-1 gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>

                <Button
                  onClick={handleAccept}
                  variant="primary"
                  size="md"
                  className="flex-1 gap-2 bg-teal-700 text-white hover:bg-teal-800"
                >
                  <PhoneIncoming className="h-4 w-4" />
                  Accept
                </Button>

              </div>

            </div>

          </CardContent>
        </Card>

        {/* My Teleconsultation Patients */}
        <Card className="border-slate-200 bg-white shadow-sm">

          <CardHeader className="px-4 pb-2 pt-4 sm:px-5">
            <CardTitle className="text-base font-bold text-slate-900">
              My Teleconsultation Patients
            </CardTitle>

            <p className="mt-0.5 text-xs text-slate-500">
              Patients who can connect with you online
            </p>
          </CardHeader>

          <CardContent className="space-y-2.5 p-4 pt-2 sm:p-5">

            {PATIENTS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                    <User className="h-5 w-5 text-teal-700" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.age}Y • {item.gender}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.reason}
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">

                  {item.status === 'CALLING' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Calling
                    </span>
                  )}

                  {item.status === 'WAITING' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Waiting
                    </span>
                  )}

                  {item.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                      <CircleCheck className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  )}

                </div>

              </div>
            ))}

          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">

          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

          <p className="text-[10px] leading-relaxed text-slate-500">
            Teleconsultations are securely managed. Patient information and
            consultation records are maintained as part of the patient's
            healthcare record.
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     CALL REJECTED
  ========================================================== */

  if (callRejected) {
    return (
      <div className="space-y-5">

        <div className="[&_h1]:text-xl [&_h1]:sm:text-2xl [&_p]:text-xs [&_p]:sm:text-sm">
          <PageHeader
            title="Teleconsultation"
            subtitle="Manage your online patient consultations."
            breadcrumbs={[
              { label: 'Doctor Dashboard', to: '/doctor' },
              { label: 'Teleconsultation' },
            ]}
          />
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <PhoneOff className="h-7 w-7 text-slate-500" />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">
              Consultation Ended
            </h2>

            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
              The patient consultation call has been declined or ended.
            </p>

            <Button
              onClick={handleBackToCalls}
              variant="primary"
              size="md"
              className="mt-5 bg-teal-700 text-white hover:bg-teal-800"
            >
              Back to Teleconsultations
            </Button>

          </CardContent>
        </Card>

      </div>
    );
  }

  /* =========================================================
     ACTIVE CONSULTATION
  ========================================================== */

  return (
    <div className="space-y-5">

      <div className="[&_h1]:text-xl [&_h1]:sm:text-2xl [&_p]:text-xs [&_p]:sm:text-sm">
        <PageHeader
          title="Teleconsultation"
          subtitle="Conduct a secure online consultation with your patient."
          breadcrumbs={[
            { label: 'Doctor Dashboard', to: '/doctor' },
            { label: 'Teleconsultation' },
          ]}
        />
      </div>

      {/* Patient Information */}
      <Card className="border-slate-200 bg-white shadow-sm">

        <CardContent className="p-4 sm:p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                <User className="h-5 w-5 text-teal-700" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {patient.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {patient.age}Y • {patient.gender} • {patient.reason}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Consultation Active
            </div>

          </div>

        </CardContent>

      </Card>

      {/* Video Area */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">

        <div className="relative aspect-video min-h-[320px] bg-slate-900">

          {/* Patient Video */}
          <div className="flex h-full items-center justify-center">

            {cameraOn ? (
              <div className="text-center text-white">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                  <User className="h-9 w-9 text-slate-300" />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  {patient.name}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Patient video
                </p>

              </div>
            ) : (
              <div className="text-center text-slate-400">

                <VideoOff className="mx-auto h-8 w-8" />

                <p className="mt-2 text-xs">
                  Patient video is off
                </p>

              </div>
            )}

          </div>

          {/* Doctor Self View */}
          <div className="absolute right-3 top-3 w-32 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 p-2 shadow-lg sm:right-4 sm:top-4 sm:w-40">

            <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-800 text-white">

              <div className="text-center">

                <Stethoscope className="mx-auto h-5 w-5 text-teal-300" />

                <p className="mt-1 text-[10px] font-semibold">
                  Doctor
                </p>

              </div>

            </div>

            <p className="mt-1.5 text-center text-[9px] text-slate-400">
              Your video
            </p>

          </div>

          {/* Call Timer */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[11px] text-white backdrop-blur-sm">

            <Clock3 className="h-3.5 w-3.5 text-slate-300" />

            <span>00:45</span>

          </div>

        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:gap-3">

          {/* Microphone */}
          <Button
            onClick={() => setMicOn(!micOn)}
            variant={micOn ? 'secondary' : 'destructive'}
            size="icon"
            className="h-11 w-11 rounded-full border-slate-200"
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micOn ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>

          {/* Camera */}
          <Button
            onClick={() => setCameraOn(!cameraOn)}
            variant={cameraOn ? 'secondary' : 'destructive'}
            size="icon"
            className="h-11 w-11 rounded-full border-slate-200"
            aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={() => setScreenSharing(!screenSharing)}
            variant={screenSharing ? 'primary' : 'secondary'}
            size="icon"
            className="h-11 w-11 rounded-full border-slate-200"
            aria-label="Share screen"
          >
            <MonitorUp className="h-4 w-4" />
          </Button>

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="icon"
            className="h-11 w-11 rounded-full"
            aria-label="End consultation"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>

        </div>

      </Card>

      {/* Consultation Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <Card className="border-slate-200 bg-white shadow-sm">

          <CardHeader className="px-4 pb-2 pt-4 sm:px-5">
            <CardTitle className="text-sm font-bold text-slate-900">
              Patient Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-4 pt-2 sm:p-5">

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">
                Patient
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {patient.name}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">
                Age
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {patient.age} Years
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">
                Gender
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {patient.gender}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Consultation
              </span>

              <span className="text-xs font-semibold text-teal-700">
                {patient.reason}
              </span>
            </div>

          </CardContent>

        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">

          <CardHeader className="px-4 pb-2 pt-4 sm:px-5">
            <CardTitle className="text-sm font-bold text-slate-900">
              Consultation Notes
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-2 sm:p-5">

           <textarea
  placeholder="Add important observations and consultation notes here..."
  className="min-h-[130px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
  rows={5}
/>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Notes are securely maintained in the patient's health record.
            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default TeleconsultationRoom;
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { appointmentApi } from '@/api/queueApi';
import { useFamily } from '@/contexts/FamilyContext';
import { Link } from 'react-router-dom';

import {
  CalendarDays,
  Clock,
  Building2,
  Stethoscope,
  MapPin,
  CheckCircle2,
  Eye,
  History,
  ShieldCheck,
  Users,
  Sun,
  Moon,
  Sparkles,
  Printer,
  Navigation,
  Check,
  ArrowRight,
  Mic,
  ChevronDown,
} from 'lucide-react';

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  room: string;
  qualification: string;
  avatar: string;
  opdDays: string;
}

const DOCTORS_BY_SPECIALTY: Record<string, DoctorOption[]> = {
  'General Medicine': [
    {
      id: 'doc_patel_01',
      name: 'Dr. Arvind Patel',
      specialty: 'General Medicine',
      experience: '14 yrs exp',
      room: 'Room 4 (1st Floor)',
      qualification: 'MBBS, MD (Medicine)',
      avatar: 'AP',
      opdDays: 'Mon - Sat',
    },
    {
      id: 'doc_mehta_02',
      name: 'Dr. Vikramaditya Mehta',
      specialty: 'General Medicine',
      experience: '18 yrs exp',
      room: 'Room 6 (1st Floor)',
      qualification: 'MD (Gen Med), DNB',
      avatar: 'VM',
      opdDays: 'Mon, Wed, Fri',
    },
    {
      id: 'doc_ananya_03',
      name: 'Dr. Ananya Patel',
      specialty: 'General Medicine',
      experience: '8 yrs exp',
      room: 'Room 2 (Ground Floor)',
      qualification: 'MBBS, DNB',
      avatar: 'AP',
      opdDays: 'Tue, Thu, Sat',
    },
  ],
  Cardiology: [
    {
      id: 'doc_cardio_01',
      name: 'Dr. K. P. Trivedi',
      specialty: 'Cardiology',
      experience: '20 yrs exp',
      room: 'Cardio Wing - Room 12',
      qualification: 'MD, DM (Cardiology)',
      avatar: 'KT',
      opdDays: 'Mon - Fri',
    },
  ],
  Orthopedics: [
    {
      id: 'doc_ortho_01',
      name: 'Dr. Rajesh Varma',
      specialty: 'Orthopedics',
      experience: '16 yrs exp',
      room: 'Ortho Wing - Room 8',
      qualification: 'MS (Orthopedics), M.Ch',
      avatar: 'RV',
      opdDays: 'Mon, Tue, Thu, Sat',
    },
  ],
  Pediatrics: [
    {
      id: 'doc_pedia_01',
      name: 'Dr. Sangeeta Rao',
      specialty: 'Pediatrics',
      experience: '12 yrs exp',
      room: 'Child Health - Room 5',
      qualification: 'MD (Pediatrics), DCH',
      avatar: 'SR',
      opdDays: 'Mon - Sat',
    },
  ],
  'Obstetrics & Gynecology': [
    {
      id: 'doc_obg_01',
      name: 'Dr. Neha Joshi',
      specialty: 'Obstetrics & Gynecology',
      experience: '15 yrs exp',
      room: 'Maternity Wing - Room 9',
      qualification: 'MS (OBG), FICOG',
      avatar: 'NJ',
      opdDays: 'Mon - Sat',
    },
  ],
};

const QUICK_REASONS = [
  { en: 'Fever & Cold', gu: 'તાવ અને શરદી', hi: 'बुखार और जुकाम', specialty: 'General Medicine' },
  { en: 'Joint / Body Pain', gu: 'હાડકા-સાંધાનો દુખાવો', hi: 'जोड़ों व शरीर में दर्द', specialty: 'Orthopedics' },
  { en: 'Blood Pressure / Sugar Check', gu: 'બીપી / સુગર તપાસ', hi: 'बीपी / शुगर जांच', specialty: 'Cardiology' },
  { en: 'General Routine Checkup', gu: 'સામાન્ય નિયમિત તપાસ', hi: 'नियमित चेकअप', specialty: 'General Medicine' },
  { en: 'Weakness / Headache', gu: 'નબળાઈ / માથાનો દુખાવો', hi: 'कमजोरी / सिरदर्द', specialty: 'General Medicine' },
  { en: 'Stomach / Indigestion', gu: 'પેટમાં દુખાવો / ગેસ', hi: 'पेट दर्द / अपच', specialty: 'General Medicine' },
  { en: 'Child Care / Baby Fever', gu: 'બાળક બીમાર / બાળ રોગ', hi: 'बच्चे की बीमारी / बाल रोग', specialty: 'Pediatrics' },
  { en: 'Women / Maternity Health', gu: 'મહિલા આરોગ્ય / પ્રસુતિ', hi: 'महिला एवं प्रसूति स्वास्थ्य', specialty: 'Obstetrics & Gynecology' },
];

const DATE_OPTIONS = [
  { id: 'today', dateStr: '2026-09-14', labelEn: 'Today (Mon)', labelGu: 'આજે (સોમ)', labelHi: 'आज (सोम)' },
  { id: 'tomorrow', dateStr: '2026-09-15', labelEn: 'Tomorrow (Tue)', labelGu: 'આવતીકાલે (મંગળ)', labelHi: 'कल (मंगल)' },
  { id: 'dayAfter', dateStr: '2026-09-16', labelEn: 'Day After (Wed)', labelGu: 'પરમદિવસે (બુધ)', labelHi: 'परसों (बुध)' },
];

const RURAL_MORNING_SLOTS = ['09:30 AM', '10:30 AM', '11:30 AM'];
const RURAL_AFTERNOON_SLOTS = ['02:30 PM', '03:30 PM'];

export const AppointmentBooking: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { members, activeMember } = useFamily();

  // Mode: 'EASY' (Default for rural people) vs 'DETAILED' (Full medical roster)
  const [mode, setMode] = useState<'EASY' | 'DETAILED'>('EASY');

  // Booking states
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember.id);
  const [facilityId, setFacilityId] = useState('fac_civil_01');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc_patel_01');
  const [date, setDate] = useState('2026-09-14');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('Routine blood sugar and blood pressure review');

  // Voice speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'IDLE' | 'LISTENING' | 'SAVED'>('IDLE');
  const recognitionRef = useRef<any>(null);

  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedTokenNumber, setBookedTokenNumber] = useState('OPD-28');
  const [showRecentVisits, setShowRecentVisits] = useState(false);

  // Available doctors under current department
  const currentDoctors = DOCTORS_BY_SPECIALTY[specialty] || DOCTORS_BY_SPECIALTY['General Medicine'];
  const activeDoctor = currentDoctors.find((d) => d.id === selectedDoctorId) || currentDoctors[0];

  // Auto-switch doctor if specialty changes
  useEffect(() => {
    if (currentDoctors.length > 0 && !currentDoctors.some((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(currentDoctors[0].id);
    }
  }, [specialty, currentDoctors, selectedDoctorId]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select speech language
      if (currentLang === 'gu') {
        recognition.lang = 'gu-IN';
      } else if (currentLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        if (transcriptText) {
          setReason(transcriptText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('SAVED');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        currentLang === 'gu'
          ? 'તમારા બ્રાઉઝરમાં માઇક સપોર્ટ નથી. કૃપા કરીને નીચે ટાઇપ કરો અથવા પસંદ કરો.'
          : currentLang === 'hi'
          ? 'आपके ब्राउज़र में माइक सपोर्ट नहीं है। कृपया नीचे टाइप करें या चुनें।'
          : 'Voice speech recognition is not supported in this browser. Please type or select below.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setVoiceStatus('SAVED');
    } else {
      try {
        setVoiceStatus('LISTENING');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Active patient details
  const bookingPatient = members.find((m) => m.id === selectedMemberId) || activeMember;
  const selectedFacility = INITIAL_FACILITIES.find((facility) => facility.id === facilityId) || INITIAL_FACILITIES[0];


  const handleBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      await appointmentApi.book({
        facilityId,
        specialty,
        date,
        timeSlot: selectedSlot,
        reasonForVisit: reason,
      });

      const randomToken = `OPD-${Math.floor(20 + Math.random() * 30)}`;
      setBookedTokenNumber(randomToken);
      setIsBooked(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const previousAppointments = [
    {
      id: 'APT-2026-001',
      date: '28 Aug 2026',
      hospital: 'Gandhinagar Civil Hospital',
      department: 'General Medicine',
      doctor: 'Dr. Arvind Patel',
      time: '10:30 AM',
      status: 'Completed',
    },
    {
      id: 'APT-2026-002',
      date: '10 Aug 2026',
      hospital: 'Mansa Community Health Centre',
      department: 'General Medicine',
      doctor: 'Dr. Vikramaditya Mehta',
      time: '11:00 AM',
      status: 'Completed',
    },
    {
      id: 'APT-2026-003',
      date: '22 Jul 2026',
      hospital: 'Gandhinagar Civil Hospital',
      department: 'Cardiology',
      doctor: 'Dr. K. P. Trivedi',
      time: '09:30 AM',
      status: 'Cancelled',
    },
  ];

  return (
    <div className="space-y-3.5 font-sans w-full pb-6">
      {/* =========================================
          PAGE HEADER WITH RURAL SIMPLICITY BADGE
      ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-200 pb-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </span>
            {t('appointments.bookAppointment', 'OPD Doctor Appointment')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('appointments.bookSubtitle', 'Simple, free hospital appointment booking for you and your family')}
          </p>
        </div>

        {/* MODE SWITCHER (EASY RURAL VS DETAILED) */}
        {!isBooked && (
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode('EASY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'EASY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('appointments.easyMode', 'Easy Mode (સરળ પદ્ધતિ)')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DETAILED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'DETAILED'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('appointments.detailedMode', 'Full Doctor Roster')}
            </button>
          </div>
        )}
      </div>

      {/* =========================================
          CONFIRMED DIGITAL OPD PASS / SLIP
      ========================================== */}
      {isBooked ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative rounded-2xl border-2 border-dashed border-emerald-400 bg-gradient-to-b from-emerald-50/90 via-white to-white p-4 sm:p-6 shadow-xs">
            {/* Header / Stamp */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Government Health Department • Government of Gujarat
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
                100% FREE (નિઃશુલ્ક સરકારી સેવા)
              </span>
            </div>

            {/* Slip Core Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Token Number Box (Huge for rural readability) */}
              <div className="md:col-span-1 text-center p-4 rounded-xl bg-emerald-700 text-white shadow-xs flex flex-col items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {t('appointments.tokenNo', 'OPD Token No.')}
                </span>
                <span className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                  #{bookedTokenNumber}
                </span>
                <span className="mt-1.5 text-[11px] font-semibold bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-100">
                  Direct OPD Queue Entry
                </span>
              </div>

              {/* Appointment Key Information */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t('appointments.patient', 'Patient Name')}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {bookingPatient.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    ABHA ID: {bookingPatient.abhaId || '14-8921-3409-7721'} • {bookingPatient.relation === 'SELF' ? 'Self' : bookingPatient.relationLabel}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {t('appointments.room', 'Room / Counter')}
                    </p>
                    <p className="text-sm sm:text-base font-black text-teal-800 mt-0.5">
                      {activeDoctor.room}
                    </p>
                    <p className="text-[11px] text-slate-500">{activeDoctor.name}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {t('appointments.time', 'Date & Time')}
                    </p>
                    <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      {selectedSlot}
                    </p>
                    <p className="text-[11px] text-slate-600 font-bold">{date}</p>
                  </div>
                </div>

                {/* Spoken/Written Reason recorded on the appointment slip */}
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    {t('appointments.reasonForVisit', 'Health Problem / Reason (તકલીફ / કારણ):')}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {reason || 'General Health Consultation'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                  <Building2 className="h-4 w-4 text-amber-700 shrink-0" />
                  <span className="font-semibold">
                    {selectedFacility.name} ({selectedFacility.district})
                  </span>
                </div>
              </div>
            </div>

            {/* Clear Rural Instructions */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-0.5">
                <p className="font-bold">
                  {t('appointments.passInstruction', 'Show this pass at the hospital counter. Consultation & medicines are free.')}
                </p>
                <p className="text-[11px] text-emerald-800">
                  • કૃપા કરીને સમયના ૧૫ મિનિટ પહેલા પહોંચો. (Please arrive 15 minutes before your slot).
                </p>
              </div>
            </div>

            {/* Actions for the Slip */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handlePrint}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>{t('appointments.downloadPass', 'Save / Print Pass')}</span>
              </Button>

              <a
                href={`https://maps.google.com/?q=${selectedFacility.coordinates.lat},${selectedFacility.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Navigation className="h-4 w-4 text-teal-700" />
                  <span>Directions (દવાખાનાનો રસ્તો)</span>
                </Button>
              </a>

              <Button
                variant="outline"
                onClick={() => setIsBooked(false)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer ml-auto"
              >
                {t('appointments.bookAnother', 'Book Another Appointment')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================
           BOOKING FLOW
        ========================================== */
        <div className="space-y-3.5">
          {mode === 'EASY' ? (
            /* =========================================
               EASY RURAL MODE (3-STEP PROGRESSIVE VIEW)
            ========================================== */
            <div className="space-y-3.5">
              {/* STEP 1: WHO IS THE PATIENT? */}
              <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
                <CardContent className="p-3 sm:p-4 space-y-2.5">
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                        1
                      </span>
                      {t('appointments.step1Title', '1. Who is the appointment for?')}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 ml-6.5">
                      {t('appointments.step1Subtitle', 'Select yourself or a family member')}
                    </p>
                  </div>

                  {/* Big Friendly Patient Selection Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    {members.map((m) => {
                      const isSelected = selectedMemberId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/80 shadow-2xs ring-1 ring-teal-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {m.name.charAt(0)}
                            </div>
                            {isSelected && (
                              <span className="h-4 w-4 rounded-full bg-teal-700 text-white flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {m.name}
                            </p>
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-0.5 ${
                                isSelected
                                  ? 'bg-teal-200/80 text-teal-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.relation === 'SELF'
                                ? 'Self (પોતે)'
                                : m.relationLabel.split(' ')[0]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* STEP 2: WHAT IS THE HEALTH PROBLEM? (VOICE & QUICK CHIPS) */}
              <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                        2
                      </span>
                      {t('appointments.step2Title', '2. What is the health problem?')}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 ml-6.5">
                      {currentLang === 'gu'
                        ? 'તમારી તકલીફ બોલો, લખો અથવા નીચે આપેલ વિકલ્પ પસંદ કરો'
                        : currentLang === 'hi'
                        ? 'अपनी परेशानी बोलें, लिखें या नीचे दिया गया विकल्प चुनें'
                        : 'Speak or type your problem, or pick a quick reason below'}
                    </p>
                  </div>

                  {/* COMPACT VOICE INPUT & QUICK REASONS */}
                  <div className="space-y-2.5">
                    {/* Compact 1-line Voice & Type bar with Save Button */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`relative flex items-center flex-1 rounded-xl border transition-all ${
                          isListening
                            ? 'border-red-500 bg-red-50/50 ring-1 ring-red-400/20'
                            : 'border-slate-300 bg-white focus-within:border-teal-700 focus-within:ring-1 focus-within:ring-teal-500/20'
                        }`}
                      >
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => {
                            setReason(e.target.value);
                            setVoiceStatus('IDLE');
                          }}
                          placeholder={
                            isListening
                              ? (currentLang === 'gu' ? 'સાંભળી રહ્યા છીએ... બોલો...' : currentLang === 'hi' ? 'सुन रहे हैं... बोलिए...' : 'Listening... speak now...')
                              : (currentLang === 'gu' ? 'તકલીફ લખો અથવા બોલો...' : currentLang === 'hi' ? 'परेशानी लिखें या बोलें...' : 'Type or speak your problem...')
                          }
                          className="h-9 w-full px-3 text-xs font-semibold text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Compact Mic Button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isListening
                            ? 'bg-red-600 text-white animate-pulse shadow-xs'
                            : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                        }`}
                      >
                        <Mic className={`h-3.5 w-3.5 ${isListening ? 'animate-bounce' : ''}`} />
                        <span>
                          {isListening
                            ? (currentLang === 'gu' ? 'સાંભળે છે...' : currentLang === 'hi' ? 'सुन रहे हैं...' : 'Listening...')
                            : (currentLang === 'gu' ? 'બોલો' : currentLang === 'hi' ? 'बोलें' : 'Speak')}
                        </span>
                      </button>

                      {/* Save Button for unambiguous confirmation */}
                      <button
                        type="button"
                        onClick={() => setVoiceStatus('SAVED')}
                        className="h-9 px-3 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{currentLang === 'gu' ? 'સાચવો' : currentLang === 'hi' ? 'सेव करें' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Clear Status Feedback so user knows it worked and is saved */}
                    {voiceStatus === 'SAVED' && reason && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {currentLang === 'gu' ? 'કાપલીમાં નોંધાયેલ: ' : currentLang === 'hi' ? 'पर्ची में दर्ज: ' : 'Saved in appointment: '}
                          <strong className="text-emerald-900">"{reason}"</strong>
                        </span>
                      </div>
                    )}

                    {/* Quick Reason Chips */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        {t('appointments.quickReason', 'Quick reason for visit (tap to select):')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_REASONS.map((r, idx) => {
                          const label =
                            currentLang === 'gu'
                              ? r.gu
                              : currentLang === 'hi'
                              ? r.hi
                              : r.en;
                          const isMatch = reason === r.en || reason === label;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setReason(label);
                                setVoiceStatus('SAVED');
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                isMatch
                                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* STEP 3: HOSPITAL, DAY & TIME */}
              <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                        3
                      </span>
                      {t('appointments.step3Title', '3. Choose Hospital, Day & Time')}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 ml-6.5">
                      {t('appointments.step3Subtitle', 'Select when you would like to visit the hospital')}
                    </p>
                  </div>

                  {/* Selected Hospital Display with Free Govt OPD badge */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {selectedFacility.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="h-3 w-3" />
                            {t('appointments.freeGovtOpd', '100% Free Govt OPD')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-teal-700" />
                          <span>{selectedFacility.distanceKm} km away • {selectedFacility.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Change Hospital Dropdown */}
                    <div className="sm:text-right shrink-0">
                      <label htmlFor="hospital-select" className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                        Change Hospital:
                      </label>
                      <select
                        id="hospital-select"
                        value={facilityId}
                        onChange={(e) => setFacilityId(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:ring-1 focus:ring-teal-500/20"
                      >
                        {INITIAL_FACILITIES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.distanceKm} km)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Day Picker (Direct User Entry) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-teal-700" />
                      <span>{t('appointments.selectDay', 'Select Day of Visit (મુલાકાતનો દિવસ / તારીખ):')}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder={
                            currentLang === 'gu'
                              ? 'મુલાકાતનો દિવસ અથવા તારીખ લખો (દા.ત. 2026-09-15 અથવા સોમવાર)...'
                              : currentLang === 'hi'
                              ? 'विज़िट का दिन या तारीख लिखें (उदा. 2026-09-15 या सोमवार)...'
                              : 'Enter day or date of visit (e.g. 2026-09-15 or Monday)...'
                          }
                          className="h-10 w-full px-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-500/20 outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <input
                        type="date"
                        value={date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) setDate(e.target.value);
                        }}
                        className="h-10 px-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 shrink-0"
                        title={currentLang === 'gu' ? 'કેલેન્ડરમાંથી તારીખ પસંદ કરો' : 'Pick from calendar'}
                      />
                    </div>
                  </div>

                  {/* Time Slots (Direct User Entry) */}
                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-teal-700" />
                      <span>{t('appointments.selectTime', 'Select Time (સમય):')}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          placeholder={
                            currentLang === 'gu'
                              ? 'તમારો અનુકૂળ સમય લખો (દા.ત. 10:30 AM, 03:00 PM)...'
                              : currentLang === 'hi'
                              ? 'अपना पसंदीदा समय लिखें (उदा. 10:30 AM, 03:00 PM)...'
                              : 'Enter preferred time (e.g. 10:30 AM, 03:00 PM)...'
                          }
                          className="h-10 w-full px-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:border-teal-700 focus:ring-1 focus:ring-teal-500/20 outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <input
                        type="time"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const formattedHour = hour % 12 || 12;
                            const padHour = formattedHour < 10 ? `0${formattedHour}` : formattedHour;
                            setSelectedSlot(`${padHour}:${m} ${ampm}`);
                          }
                        }}
                        className="h-10 px-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 shrink-0"
                        title={currentLang === 'gu' ? 'ઘડિયાળમાંથી સમય પસંદ કરો' : 'Pick time from clock'}
                      />
                    </div>
                  </div>

                  {/* Summary & Big Action Button */}
                  <div className="pt-2.5 border-t border-slate-200 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-1.5">
                      <div>
                        <p className="font-bold text-slate-900">
                          {bookingPatient.name} • {activeDoctor.name} ({activeDoctor.room})
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {date} at <strong className="text-teal-800">{selectedSlot}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        ✓ No Fee Required
                      </span>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleBooking()}
                      isLoading={isLoading}
                      className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{t('appointments.confirmBooking', 'Book Free OPD Appointment')}</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* =========================================
               DETAILED ROSTER MODE (FULL CONTROLS)
            ========================================== */
            <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
              <CardContent className="p-3 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">
                    Standard Medical OPD Roster
                  </h2>
                  <span className="text-xs text-slate-500">
                    Advanced booking mode with full doctor qualifications
                  </span>
                </div>

                {/* Patient Household selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Household Member:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 ${
                          selectedMemberId === m.id
                            ? 'bg-teal-800 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.name} ({m.relation === 'SELF' ? 'Self' : m.relationLabel})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hospital and Department Selects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="detailed-hospital-select" className="text-xs font-bold text-slate-700">
                      {t('appointments.selectHospital', 'Select Hospital')}
                    </label>
                    <select
                      id="detailed-hospital-select"
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      {INITIAL_FACILITIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="detailed-specialty-select" className="text-xs font-bold text-slate-700">
                      {t('appointments.selectDepartment', 'Select Department')}
                    </label>
                    <select
                      id="detailed-specialty-select"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Obstetrics & Gynecology">Women&apos;s Health (OBG)</option>
                    </select>
                  </div>
                </div>

                {/* Doctor Selection with Bios */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t('appointments.selectDoctor', 'Select Doctor')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedDoctorId === doc.id
                            ? 'border-teal-700 bg-teal-50/70 ring-1 ring-teal-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                          <p className="text-[10px] text-slate-500">
                            {doc.qualification} • {doc.room}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                          {doc.opdDays}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Reason Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <Input
                    label={t('appointments.selectDate', 'Select Date')}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 rounded-lg"
                  />
                  <Input
                    label={t('appointments.reasonForVisit', 'Reason for Visit')}
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-9 rounded-lg"
                  />
                </div>

                {/* Slot Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t('appointments.selectTimeSlot', 'Select Time Slot')}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[...RURAL_MORNING_SLOTS, ...RURAL_AFTERNOON_SLOTS].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-1.5 px-1 text-center rounded-lg border text-xs font-semibold cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-teal-700 text-white font-bold'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleBooking()}
                  isLoading={isLoading}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  {t('appointments.confirmBooking', 'Confirm Booking')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* =========================================
              RECENT HOSPITAL VISITS (COLLAPSIBLE DROPDOWN - HIDDEN BY DEFAULT)
          ========================================== */}
          <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRecentVisits(!showRecentVisits)}
              className="w-full p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              aria-expanded={showRecentVisits}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{t('appointments.pastVisits', 'Recent Hospital Visits')}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {previousAppointments.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentLang === 'gu'
                      ? 'જૂની મુલાકાતો અને કાપલીઓ જોવા અહીં દબાવો'
                      : currentLang === 'hi'
                      ? 'पुरानी पर्ची और विज़िट देखने के लिए यहाँ दबाएँ'
                      : 'Tap to view or hide previous visits and slips'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors shrink-0">
                <span>
                  {showRecentVisits
                    ? (currentLang === 'gu' ? 'બંધ કરો' : currentLang === 'hi' ? 'छुपाएं' : 'Hide')
                    : (currentLang === 'gu' ? 'જુઓ' : currentLang === 'hi' ? 'देखें' : 'View')}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-teal-700 transition-transform duration-200 ${
                    showRecentVisits ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {showRecentVisits && (
              <CardContent className="p-3 sm:p-4 pt-0 border-t border-slate-100">
                <div className="divide-y divide-slate-100">
                  {previousAppointments.map((apt) => (
                    <div key={apt.id} className="py-2.5 flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-900">{apt.hospital}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {apt.doctor} • {apt.department} • {apt.date} at {apt.time}
                        </p>
                      </div>

                      <Link
                        to={`/patient/appointments/${apt.id}`}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-teal-700 hover:bg-slate-50 shrink-0 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>{t('appointments.viewDetails', 'View Slip')}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
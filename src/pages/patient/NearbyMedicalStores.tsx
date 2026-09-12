import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { INITIAL_MEDICAL_STORES } from '@/mock/medicalStoresData';
import {
  Search,
  Pill,
  MapPin,
  Phone,
  Clock,
  Building2,
  Navigation,
  MessageCircle,
  X,
  CheckCircle2,
  ShieldCheck,
  Percent,
} from 'lucide-react';

// Common quick search medicines tailored for rural health needs
const QUICK_MEDICINES = [
  { labelEn: 'Fever (Paracetamol)', labelGu: 'તાવ-શરદી (પેરાસિટામોલ)', labelHi: 'बुखार (पैरासिटामोल)', query: 'Paracetamol', icon: '🌡️' },
  { labelEn: 'Gas & Acidity', labelGu: 'એસિડિટી-ગેસ (પેન્ટોપ્રાઝોલ)', labelHi: 'गैस-एसिडिटी', query: 'Pantoprazole', icon: '💊' },
  { labelEn: 'BP (Amlodipine)', labelGu: 'બ્લડ પ્રેશર (એમલોડીપીન)', labelHi: 'ब्लड प्रेशर', query: 'Amlodipine', icon: '🩺' },
  { labelEn: 'Sugar (Metformin)', labelGu: 'ડાયાબિટીસ (મેટફોર્મિન)', labelHi: 'शुगर / डायबिटीज', query: 'Metformin', icon: '🩸' },
  { labelEn: 'ORS Sachet', labelGu: 'ઓ.આર.એસ (ઝાડા-નબળાઈ)', labelHi: 'ओआरएस (कमजोरी)', query: 'ORS', icon: '💧' },
  { labelEn: 'Pain Relief (Aspirin)', labelGu: 'શરીરનો દુખાવો', labelHi: 'दर्द निवारक', query: 'Aspirin', icon: '🩹' },
];

export const NearbyMedicalStores: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'JAN_AUSHADHI' | '24X7'>('ALL');

  // Filtered Stores: STRICTLY SHOW ONLY CURRENTLY OPEN STORES
  const filteredStores = useMemo(() => {
    let result = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow);

    // Filter by store category
    if (selectedFilter === 'JAN_AUSHADHI') {
      result = result.filter((s) => s.isJanAushadhi);
    } else if (selectedFilter === '24X7') {
      result = result.filter((s) => s.timings.includes('24'));
    }

    // Filter by search query (store name, area, or medicine name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const matchesStoreName = s.name.toLowerCase().includes(q);
        const matchesArea = s.area.toLowerCase().includes(q) || s.fullAddress.toLowerCase().includes(q);
        const matchesMedicine = s.stockCatalog.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.genericName.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        );
        return matchesStoreName || matchesArea || matchesMedicine;
      });
    }

    // Sort: Government Jan Aushadhi Kendras first (up to 80% discount for rural families), then by nearest distance
    result.sort((a, b) => {
      if (a.isJanAushadhi && !b.isJanAushadhi) return -1;
      if (!a.isJanAushadhi && b.isJanAushadhi) return 1;
      return a.distanceKm - b.distanceKm;
    });

    return result;
  }, [searchQuery, selectedFilter]);

  const totalOpenStores = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow).length;
  const totalJanAushadhi = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow && s.isJanAushadhi).length;
  const total24x7 = INITIAL_MEDICAL_STORES.filter((s) => s.isOpenNow && s.timings.includes('24')).length;

  return (
    <div className="w-full space-y-3 pb-8">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <PageHeader
        title={
          currentLang === 'gu'
            ? 'નજીકના મેડિકલ સ્ટોર અને જન ઔષધિ કેન્દ્ર'
            : currentLang === 'hi'
            ? 'नज़दीकी मेडिकल स्टोर एवं जन औषधि केंद्र'
            : 'Nearby Medical Stores & Jan Aushadhi'
        }
        subtitle={
          currentLang === 'gu'
            ? 'તમારી નજીકની ખુલ્લી દવાની દુકાન શોધો, ભાવ તપાસો અને સીધો ફોન કરો'
            : currentLang === 'hi'
            ? 'अपने पास की खुली दवा दुकान देखें, दाम जानें और सीधे फोन करें'
            : 'Find open pharmacies near you, check medicine prices, and call directly'
        }
        breadcrumbs={[
          { label: t('nav.dashboard', 'Dashboard'), to: '/patient' },
          { label: t('nav.medicalStores', 'Medical Stores') },
        ]}
      />

      {/* ================================================== */}
      {/* RURAL BENEFITS BANNER: GOVT JAN AUSHADHI 80% DISCOUNT */}
      {/* ================================================== */}
      <div className="rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-extrabold text-emerald-950 text-xs sm:text-sm">
              {currentLang === 'gu'
                ? 'સરકારી પ્રધાનમંત્રી જન ઔષધિ કેન્દ્ર (PMBJP)'
                : currentLang === 'hi'
                ? 'सरकारी प्रधानमंत्री जन औषधि केंद्र (PMBJP)'
                : 'Government Pradhan Mantri Jan Aushadhi (PMBJP)'}
            </p>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              {currentLang === 'gu'
                ? 'અહીં ૫૦% થી ૮૦% સુધી સસ્તી અને સારી ગુણવત્તાવાળી જેનરિક દવાઓ મળે છે'
                : currentLang === 'hi'
                ? 'यहाँ 50% से 80% तक सस्ती और उच्च गुणवत्ता वाली जेनेरिक दवाएं मिलती हैं'
                : 'High quality generic medicines available at 50% to 80% lower cost'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white">
            <Percent className="h-3 w-3" />
            <span>{currentLang === 'gu' ? '૮૦% બચત' : currentLang === 'hi' ? '80% बचत' : 'Up to 80% Off'}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-300">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>{currentLang === 'gu' ? '૧૦૦% શુદ્ધ' : currentLang === 'hi' ? '100% शुद्ध' : 'Govt Certified'}</span>
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* SIMPLE SEARCH & QUICK MEDICINE CHIPS */}
      {/* ================================================== */}
      <Card className="border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
        <CardContent className="p-3 sm:p-4 space-y-3">
          {/* 1-Line Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentLang === 'gu'
                  ? 'દવાનું નામ અથવા ગામ/વિસ્તાર લખો (દા.ત. પેરાસિટામોલ, સેક્ટર ૨૧)...'
                  : currentLang === 'hi'
                  ? 'दवा का नाम या क्षेत्र लिखें (उदा. पैरासिटामोल, सेक्टर 21)...'
                  : 'Search medicine name or area (e.g. Paracetamol, Sector 21)...'
              }
              className="h-11 w-full pl-10 pr-9 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-500/20 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick 1-Tap Medicine Chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Pill className="h-3 w-3 text-teal-700" />
              <span>
                {currentLang === 'gu'
                  ? 'સામાન્ય દવાઓ (પસંદ કરવા દબાવો):'
                  : currentLang === 'hi'
                  ? 'सामान्य दवाएं (चुनने के लिए दबाएं):'
                  : 'Common Medicines (Tap to select):'}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_MEDICINES.map((item, idx) => {
                const label =
                  currentLang === 'gu'
                    ? item.labelGu
                    : currentLang === 'hi'
                    ? item.labelHi
                    : item.labelEn;
                const isSelected = searchQuery.toLowerCase() === item.query.toLowerCase();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(item.query);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs font-bold ring-2 ring-teal-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Clean Filter Tabs */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedFilter === 'ALL'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {currentLang === 'gu' ? `બધા ખુલ્લા સ્ટોર (${totalOpenStores})` : currentLang === 'hi' ? `सभी खुली दुकानें (${totalOpenStores})` : `All Open Stores (${totalOpenStores})`}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('JAN_AUSHADHI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                  selectedFilter === 'JAN_AUSHADHI'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>🏛️</span>
                <span>{currentLang === 'gu' ? `જન ઔષધિ (${totalJanAushadhi})` : currentLang === 'hi' ? `जन औषधि (${totalJanAushadhi})` : `Jan Aushadhi (${totalJanAushadhi})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('24X7')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                  selectedFilter === '24X7'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>⏰</span>
                <span>{currentLang === 'gu' ? `૨૪ કલાક ખુલ્લા (${total24x7})` : currentLang === 'hi' ? `24 घंटे खुली (${total24x7})` : `24x7 Open (${total24x7})`}</span>
              </button>
            </div>

            <span className="text-emerald-800 text-[11px] font-bold flex items-center gap-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                {currentLang === 'gu'
                  ? 'હાલ ખુલ્લી દુકાનો જ બતાવે છે'
                  : currentLang === 'hi'
                  ? 'केवल खुली दुकानें दिखाई जा रही हैं'
                  : 'Showing open stores only'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* MEDICAL STORES LIST: ULTRA-SIMPLE & ACCESSIBLE */}
      {/* ================================================== */}
      {filteredStores.length === 0 ? (
        <Card className="p-8 text-center border-slate-200 bg-white rounded-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {currentLang === 'gu' ? 'કોઈ મેડિકલ સ્ટોર મળ્યો નથી' : currentLang === 'hi' ? 'कोई दुकान नहीं मिली' : 'No medical stores found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {currentLang === 'gu'
              ? 'કૃપા કરીને દવાનું નામ અથવા વિસ્તાર બદલીને ફરીથી શોધો'
              : currentLang === 'hi'
              ? 'कृपया दवा का नाम या क्षेत्र बदलकर दोबारा खोजें'
              : 'Try searching for another medicine or resetting the search filter'}
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('ALL');
            }}
            variant="outline"
            size="sm"
            className="mt-3 text-xs font-bold rounded-xl cursor-pointer"
          >
            {currentLang === 'gu' ? 'શોધ ફરી સેટ કરો' : currentLang === 'hi' ? 'रीसेट करें' : 'Reset Search'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStores.map((store) => {
            const hasCatalog = store.stockCatalog && store.stockCatalog.length > 0;
            const matchedMedicine = searchQuery.trim() && hasCatalog
              ? store.stockCatalog.find(
                  (m) =>
                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : null;

            return (
              <Card
                key={store.id}
                className={`rounded-xl overflow-hidden transition-all ${
                  store.isJanAushadhi
                    ? 'border-2 border-teal-600/40 bg-teal-50/15 shadow-2xs'
                    : store.type === 'HOSPITAL_PHARMACY'
                    ? 'border-2 border-blue-600/40 bg-blue-50/15 shadow-2xs'
                    : 'border border-slate-200 bg-white shadow-2xs'
                }`}
              >
                <CardContent className="p-3.5 sm:p-4 space-y-3">
                  {/* Top Bar: Badges, Distance & Open Status */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {store.isJanAushadhi ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-teal-800 text-white px-2.5 py-1 text-xs font-black shadow-2xs">
                          <Building2 className="h-3.5 w-3.5 text-amber-300" />
                          <span>
                            {currentLang === 'gu'
                              ? 'સરકારી જન ઔષધિ (PMBJP)'
                              : currentLang === 'hi'
                              ? 'सरकारी जन औषधि (PMBJP)'
                              : 'Govt Jan Aushadhi (PMBJP)'}
                          </span>
                        </span>
                      ) : store.type === 'HOSPITAL_PHARMACY' ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-700 text-white px-2.5 py-1 text-xs font-black shadow-2xs">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>
                            {currentLang === 'gu'
                              ? 'હોસ્પિટલ દવાખાનું (૧૦૦% મફત દવા)'
                              : currentLang === 'hi'
                              ? 'अस्पताल दवाखाना (100% मुफ्त दवा)'
                              : 'Hospital Dispensary (100% Free)'}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 text-[11px] font-bold">
                          {currentLang === 'gu' ? 'મેડિકલ સ્ટોર' : currentLang === 'hi' ? 'मेडिकल स्टोर' : 'Private Pharmacy'}
                        </span>
                      )}

                      {store.timings.includes('24') && (
                        <span className="inline-flex items-center rounded-lg bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 text-[11px] font-bold">
                          {currentLang === 'gu' ? '૨૪ કલાક ખુલ્લું' : currentLang === 'hi' ? '24 घंटे खुली' : '24x7 Open'}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        <Clock className="h-3 w-3" />
                        <span>
                          {currentLang === 'gu' ? 'અત્યારે ખુલ્લું છે' : currentLang === 'hi' ? 'खुली है' : 'Open Now'}
                        </span>
                      </span>
                    </div>

                    {/* Distance Pill */}
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-black text-slate-800 shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-teal-700" />
                      <span>{store.distanceKm} km {currentLang === 'gu' ? 'દૂર' : currentLang === 'hi' ? 'दूर' : 'away'}</span>
                    </span>
                  </div>

                  {/* Store Name & Location */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>📍 {store.fullAddress}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ⏰ {currentLang === 'gu' ? 'સમય:' : currentLang === 'hi' ? 'समय:' : 'Timings:'} {store.timings}
                    </p>
                  </div>

                  {/* Medicine Stock & Government Rate Highlight */}
                  {hasCatalog && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 space-y-1.5">
                      {matchedMedicine ? (
                        <div className="flex items-center justify-between gap-2 flex-wrap bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                          <div>
                            <div className="flex items-center gap-1 text-emerald-900 font-bold text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{matchedMedicine.name} ({matchedMedicine.unit})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {matchedMedicine.genericName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] text-slate-400 line-through">
                                ₹{matchedMedicine.brandPrice}
                              </span>
                              <span className="text-base font-black text-teal-900">
                                ₹{matchedMedicine.genericPrice}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-700">
                              {currentLang === 'gu'
                                ? `બચત: ₹${(matchedMedicine.brandPrice || 0) - (matchedMedicine.genericPrice || 0)}`
                                : `Save ₹${(matchedMedicine.brandPrice || 0) - (matchedMedicine.genericPrice || 0)}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            {currentLang === 'gu'
                              ? 'સામાન્ય દવાઓના સરકારી સસ્તા ભાવ:'
                              : currentLang === 'hi'
                              ? 'सामान्य दवाओं के सरकारी सस्ते दाम:'
                              : 'Essential Medicines & Govt Generic Rates:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {store.stockCatalog.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0 pr-1">
                                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    ✓ {currentLang === 'gu' ? 'ઉપલબ્ધ' : currentLang === 'hi' ? 'उपलब्ध' : 'In Stock'}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-teal-900 text-sm">₹{item.genericPrice}</span>
                                  <span className="text-[10px] text-slate-400 line-through block">₹{item.brandPrice}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2-3 BIG, FRIENDLY ACTION BUTTONS (CALL & DIRECTIONS) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* 1. CALL BUTTON (Large & Green - #1 Priority for rural patients) */}
                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Phone className="h-4 w-4" />
                          <span>
                            {currentLang === 'gu'
                              ? `ફોન કરો (${store.phone})`
                              : currentLang === 'hi'
                              ? `फोन करें (${store.phone})`
                              : `Call Store (${store.phone})`}
                          </span>
                        </Button>
                      </a>

                      {/* 2. DIRECTIONS (GOOGLE MAPS) */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${store.name} ${store.fullAddress}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="h-4 w-4 text-teal-700" />
                          <span>
                            {currentLang === 'gu' ? 'રસ્તો જુઓ' : currentLang === 'hi' ? 'रास्ता देखें' : 'Directions'}
                          </span>
                        </Button>
                      </a>

                      {/* 3. WHATSAPP (if chemist has WhatsApp) */}
                      {store.whatsappPhone && (
                        <a
                          href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
                            `નમસ્તે! શું તમારી પાસે ${searchQuery || 'આ દવા'} ઉપલબ્ધ છે?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="h-4 w-4 text-emerald-700" />
                            <span>WhatsApp</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

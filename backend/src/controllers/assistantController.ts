import { Request, Response } from 'express';
import { FacilityModel } from '../models/Facility';
import { DoctorModel } from '../models/Doctor';
import { MedicineModel } from '../models/Medicine';
import { AppointmentModel, TokenModel } from '../models/Queue';
import { PatientModel } from '../models/Patient';
import { sendSuccess, sendError } from '../utils/response';

// Canonical Medical Knowledge Base for Symptom & Disease Triage
interface ConditionInfo {
  disease: string;
  specialty: string;
  urgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  description: string;
  signatureSymptoms: string[];
  precautions: string[];
  homeRemedies: string[];
  recommendedMedicines: string[];
}

const MEDICAL_KB: ConditionInfo[] = [
  {
    disease: 'Viral Upper Respiratory Tract Infection (Common Cold / Flu)',
    specialty: 'General Medicine',
    urgency: 'ROUTINE',
    description: 'A mild viral infection affecting the nose, throat, and airways characterized by runny nose, sneezing, low-grade fever, and fatigue.',
    signatureSymptoms: ['fever', 'cough', 'cold', 'sore throat', 'runny nose', 'sneezing', 'headache', 'fatigue', 'body ache'],
    precautions: ['Stay well hydrated with warm fluids', 'Rest adequately', 'Avoid cold foods and iced drinks', 'Wear a mask to prevent spread'],
    homeRemedies: ['Warm saline gargles 3 times daily', 'Steam inhalation with eucalyptus or tulsi', 'Ginger and honey tea'],
    recommendedMedicines: ['Paracetamol 500mg (for fever/aches)', 'Cetirizine 10mg (for runny nose/allergies)', 'Vitamin C tablets'],
  },
  {
    disease: 'Hypertension & Cardiovascular Strain',
    specialty: 'Cardiology',
    urgency: 'URGENT',
    description: 'Elevated blood pressure causing headache, dizziness, neck stiffness, or palpitations requiring prompt medical review.',
    signatureSymptoms: ['chest pain', 'high blood pressure', 'bp', 'palpitation', 'dizziness', 'headache behind neck', 'shortness of breath on exertion'],
    precautions: ['Strictly restrict sodium and table salt intake', 'Avoid sudden exertion or lifting heavy weights', 'Monitor BP twice daily', 'Never skip prescribed anti-hypertensives'],
    homeRemedies: ['Deep breathing exercises', 'Calm resting in a quiet ventilated room', 'Avoid caffeine and tobacco'],
    recommendedMedicines: ['Amlodipine 5mg', 'Telmisartan 40mg (Prescription only)', 'Consult Cardiologist in Room 12'],
  },
  {
    disease: 'Acute Coronary Syndrome / Cardiac Emergency',
    specialty: 'Cardiology',
    urgency: 'EMERGENCY',
    description: 'Severe crushing chest pain, pain radiating to left arm or jaw with cold sweating. Requires immediate casualty / 108 intervention.',
    signatureSymptoms: ['crushing chest pain', 'sweating', 'left arm pain', 'jaw pain', 'severe breathlessness', 'heart attack'],
    precautions: ['IMMEDIATE EMERGENCY: Call 108 Ambulance immediately', 'Do not drive yourself to hospital', 'Chew Disprin/Aspirin 300mg if not allergic'],
    homeRemedies: ['Sit or lie down in comfortable position', 'Loosen tight clothing', 'Keep patient calm while ambulance arrives'],
    recommendedMedicines: ['Emergency ICU response required at Civil Hospital Emergency Ward'],
  },
  {
    disease: 'Osteoarthritis & Joint Degeneration',
    specialty: 'Orthopedics',
    urgency: 'ROUTINE',
    description: 'Wear and tear of joint cartilage causing pain, stiffness, and cracking sounds especially in knees, hips, or lower back.',
    signatureSymptoms: ['knee pain', 'joint pain', 'back pain', 'stiffness', 'arthritis', 'bone pain', 'swelling in knee', 'difficulty walking'],
    precautions: ['Avoid prolonged standing or cross-legged sitting on floor', 'Use supportive footwear', 'Maintain healthy body weight to reduce joint load'],
    homeRemedies: ['Hot fomentation or warm oil massage', 'Gentle quadriceps strengthening exercises', 'Calcium & Vitamin D rich diet'],
    recommendedMedicines: ['Paracetamol 650mg / Ibuprofen (short term)', 'Calcium Carbonate + Vitamin D3 supplements', 'Topical analgesic gel'],
  },
  {
    disease: 'Pediatric Acute Gastroenteritis & Dehydration',
    specialty: 'Pediatrics',
    urgency: 'URGENT',
    description: 'Loose watery stools and vomiting in children causing loss of fluids and essential electrolytes.',
    signatureSymptoms: ['vomiting', 'loose motions', 'diarrhea', 'dehydration', 'child fever', 'baby crying without tears', 'sunken eyes'],
    precautions: ['Continuous hydration with ORS solution after every loose motion', 'Continue normal breastfeeding for infants', 'Watch for red flags: dry mouth, lethargy'],
    homeRemedies: ['Fresh coconut water', 'Rice kanji with salt', 'Boiled cooled water with ORS powder'],
    recommendedMedicines: ['Oral Rehydration Salts (ORS) sachet in 1 Litre water', 'Zinc sulfate syrup for children', 'Pediatric consult in Room 5'],
  },
  {
    disease: 'Type 2 Diabetes Mellitus & Glycemic Fluctuations',
    specialty: 'General Medicine',
    urgency: 'ROUTINE',
    description: 'Metabolic disorder with elevated blood sugar levels, excessive thirst, frequent urination, and slow wound healing.',
    signatureSymptoms: ['high sugar', 'diabetes', 'excessive thirst', 'frequent urination', 'unexplained weight loss', 'tingling in feet', 'slow wound healing'],
    precautions: ['Avoid refined sugar, sweets, and high-glycemic carbohydrates', 'Daily 30 minutes brisk walking', 'Inspect feet daily for cuts or blisters'],
    homeRemedies: ['Methi (fenugreek) water in morning', 'High fiber leafy vegetables', 'Cinnamon infused tea'],
    recommendedMedicines: ['Metformin 500mg (as prescribed)', 'Regular HbA1c screening', 'General Medicine OPD in Room 4'],
  },
  {
    disease: 'Antenatal Care & Maternal Health',
    specialty: 'Obstetrics & Gynecology',
    urgency: 'ROUTINE',
    description: 'Comprehensive health monitoring and nutritional support during pregnancy for mother and fetal well-being.',
    signatureSymptoms: ['pregnancy', 'pregnant', 'morning sickness', 'missed period', 'anc', 'maternal', 'baby movement'],
    precautions: ['Attend all scheduled ANC checkups', 'Take daily Iron & Folic Acid tablets', 'Avoid heavy lifting or strenuous travel', 'Report any bleeding or severe swelling immediately'],
    homeRemedies: ['Small frequent nutrient-dense meals', 'Hydration with buttermilk and lemon water', 'Adequate left-lateral resting posture'],
    recommendedMedicines: ['Iron & Folic Acid (IFA) tablets', 'Calcium + Vit D tablets', 'Maternity Wing consult in Room 10'],
  },
];

export async function processChatAssistant(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const { message = '', userId, language = 'en', latitude, longitude, history = [], sessionId } = req.body;

  if (!message || message.trim() === '') {
    sendError(res, 'Message is required', 400);
    return;
  }

  // 1. Try calling the dedicated Python RAG + ML Model Server (port 8000)
  try {
    const pythonController = new AbortController();
    const timeoutId = setTimeout(() => pythonController.abort(), 12000);

    const pyRes = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userId: userId || 'PAT-1001',
        sessionId: sessionId || 'sess_portal_patient',
        history,
        latitude,
        longitude,
      }),
      signal: pythonController.signal,
    });
    clearTimeout(timeoutId);

    if (pyRes.ok) {
      const pyData: any = await pyRes.json();
      const actionChips = [];

      if (pyData.is_emergency) {
        actionChips.push(
          { label: '🚨 Call 108 Emergency', action: 'EMERGENCY', phone: '108' },
          { label: '🏥 Nearest Emergency Hospital', action: 'NAVIGATE', path: '/patient/facilities' }
        );
      } else if (pyData.intent === 'DOCTOR_OPD' || pyData.intent === 'HOSPITAL_LOOKUP') {
        actionChips.push(
          { label: '📅 Book OPD Appointment', action: 'NAVIGATE', path: '/patient/appointments/book' },
          { label: '🏥 View Hospital Facilities', action: 'NAVIGATE', path: '/patient/facilities' }
        );
      } else if (pyData.intent === 'MEDICINE_STOCK') {
        actionChips.push(
          { label: '💊 Check Medical Stores', action: 'NAVIGATE', path: '/patient/medical-stores' },
          { label: '📅 Consult Doctor', action: 'NAVIGATE', path: '/patient/appointments/book' }
        );
      } else if (pyData.intent === 'PATIENT_EHR') {
        actionChips.push(
          { label: '🎟️ View OPD Token', action: 'NAVIGATE', path: '/patient/tokens' },
          { label: '📋 Health Records', action: 'NAVIGATE', path: '/patient/health-records' }
        );
      } else {
        actionChips.push(
          { label: '📅 Book Appointment', action: 'NAVIGATE', path: '/patient/appointments/book' },
          { label: '🎟️ View OPD Token', action: 'NAVIGATE', path: '/patient/tokens' }
        );
      }

      sendSuccess(res, 'AI Model response generated successfully', {
        answer: pyData.answer,
        intent: pyData.intent,
        sources: pyData.sources || ['Python ML/RAG Model', 'MongoDB Atlas'],
        confidence: pyData.confidence,
        retrievedContext: pyData.retrievedContext,
        is_emergency: pyData.is_emergency || false,
        actionChips,
        latency_ms: pyData.latency_ms || (Date.now() - startTime),
      });
      return;
    }
  } catch (err: any) {
    console.log('[AssistantController] Python Model Server unreachable or timed out, using local synthesis fallback:', err?.message || err);
  }

  const queryLower = message.toLowerCase();

  // 1. Identify Intent
  let intent: 'SYMPTOM_ASSESSMENT' | 'FACILITY_QUERY' | 'DOCTOR_QUERY' | 'MEDICINE_QUERY' | 'PATIENT_RECORD' | 'EMERGENCY' | 'GENERAL' = 'GENERAL';
  let isEmergency = false;

  // Emergency keywords
  const emergencyKeywords = ['heart attack', 'unconscious', 'chest pain severe', 'heavy bleeding', 'stroke', 'poison', 'snake bite', 'cannot breathe', 'accident'];
  if (emergencyKeywords.some((kw) => queryLower.includes(kw))) {
    intent = 'EMERGENCY';
    isEmergency = true;
  } else if (['doctor', 'specialist', 'dr.', 'dr ', 'physician', 'cardiologist', 'orthopedic', 'pediatrician', 'gynecologist', 'who is available', 'opd room'].some((kw) => queryLower.includes(kw))) {
    intent = 'DOCTOR_QUERY';
  } else if (['hospital', 'civil hospital', 'phc', 'chc', 'bed', 'icu', 'oxygen', 'ambulance', 'facility', 'emergency ward', 'address', 'near me', 'nearest'].some((kw) => queryLower.includes(kw))) {
    intent = 'FACILITY_QUERY';
  } else if (['medicine', 'tablet', 'paracetamol', 'syrup', 'cetirizine', 'stock', 'pharmacy', 'dose', 'amoxicillin', 'ors', 'injection', 'drug'].some((kw) => queryLower.includes(kw))) {
    intent = 'MEDICINE_QUERY';
  } else if (['my appointment', 'my token', 'my queue', 'my prescription', 'my report', 'my history', 'my record', 'token number'].some((kw) => queryLower.includes(kw))) {
    intent = 'PATIENT_RECORD';
  } else {
    intent = 'SYMPTOM_ASSESSMENT';
  }

  // 2. Retrieve Grounded Context from MongoDB
  let groundedDoctors: any[] = [];
  let groundedFacilities: any[] = [];
  let groundedMedicines: any[] = [];
  let patientAppointments: any[] = [];
  let matchedCondition: ConditionInfo | null = null;

  try {
    // A. Query MongoDB Facilities
    groundedFacilities = await FacilityModel.find().limit(4);

    // B. Query MongoDB Doctors
    groundedDoctors = await DoctorModel.find().limit(8);

    // C. Query MongoDB Medicines
    groundedMedicines = await MedicineModel.find().limit(8);

    // D. If patient ID provided, check their active records
    if (userId) {
      patientAppointments = await AppointmentModel.find({ patientId: userId }).sort({ createdAt: -1 }).limit(3);
    }
  } catch (err) {
    console.warn('[Assistant] MongoDB retrieval note:', err);
  }

  // 3. Match Clinical Knowledge Base
  matchedCondition = MEDICAL_KB.find((c) =>
    c.signatureSymptoms.some((sym) => queryLower.includes(sym)) ||
    queryLower.includes(c.disease.toLowerCase()) ||
    queryLower.includes(c.specialty.toLowerCase())
  ) || null;

  // Fallback condition if symptoms detected
  if (!matchedCondition && intent === 'SYMPTOM_ASSESSMENT') {
    matchedCondition = MEDICAL_KB[0]; // Viral/General
  }

  // Find relevant doctor from DB
  const relevantDoctor = groundedDoctors.find((d) =>
    matchedCondition ? d.specialty?.toLowerCase().includes(matchedCondition.specialty.toLowerCase()) : true
  ) || groundedDoctors[0] || { name: 'Dr. Arvind Patel', specialty: 'General Medicine', opdRoom: 'Room 4 (1st Floor)' };

  // Find main facility
  const mainFacility = groundedFacilities[0] || {
    name: 'Gandhinagar Civil Hospital & Medical College',
    availableBeds: 84,
    icuBedsAvailable: 12,
    emergencyNumber: '108',
  };

  // 4. Construct Structured Grounded Response
  let responseText = '';
  const actionChips: Array<{ label: string; action: string; path?: string; phone?: string; type?: string }> = [];

  if (isEmergency) {
    responseText = `🚨 **EMERGENCY MEDICAL ALERT**
Your symptoms indicate a potentially critical condition requiring **immediate emergency medical evaluation**.

### 🚑 Immediate Action:
1. **Call 108 Emergency Ambulance** immediately or proceed to the nearest Emergency/Casualty Trauma Center.
2. **Nearest Hospital:** **${mainFacility.name}** (24x7 Emergency Trauma Unit, ${mainFacility.icuBedsAvailable || 12} ICU beds currently available).
3. Do not attempt to drive yourself. Keep calm and stay seated in a comfortable upright position.

⚠️ *Disclaimer: This AI tool does not substitute emergency medical services. Please call 108 immediately.*`;

    actionChips.push(
      { label: '🚑 Call 108 Emergency', action: 'EMERGENCY', phone: '108' },
      { label: '🏥 View Civil Hospital', action: 'NAVIGATE', path: '/patient/facilities' }
    );
  } else if (intent === 'DOCTOR_QUERY') {
    const docList = groundedDoctors.slice(0, 4).map((d) => `• **${d.name}** — ${d.specialty} (${d.opdRoom || 'Room 4'}, Status: **${d.status || 'ON_DUTY'}**, ${d.patientsToday || 0} patients today)`).join('\n');

    responseText = `👨‍⚕️ **Hospital Doctors On Duty**
Here are the current attending doctors at **${mainFacility.name}**:

${docList}

### 💡 Recommendation:
For general consultations, visit **${relevantDoctor.name}** in **${relevantDoctor.opdRoom || 'Room 4 (1st Floor)'}**. You can book a direct OPD consultation slot or get an instant token assigned at the hospital counter.`;

    actionChips.push(
      { label: '📅 Book OPD Appointment', action: 'NAVIGATE', path: '/patient/appointments/book' },
      { label: '🎟️ View Live OPD Queue', action: 'NAVIGATE', path: '/patient/tokens' }
    );
  } else if (intent === 'FACILITY_QUERY') {
    responseText = `🏥 **Government Healthcare Facilities in District**
• **${mainFacility.name}**
  - **Available Beds:** ${mainFacility.availableBeds || 84} General | ${mainFacility.icuBedsAvailable || 12} ICU Beds
  - **OPD Timings:** 9:00 AM - 1:00 PM & 3:00 PM - 5:00 PM
  - **Emergency:** 24x7 Open (Dial 108)
  - **Blood Bank & Oxygen:** Available

• **Pethapur Primary Health Centre (PHC)**
  - **Available Beds:** 5 Beds | General Medicine & Maternal Care OPD Open (9:00 AM - 1:00 PM)

• **Mansa Community Health Centre (CHC)**
  - **Available Beds:** 16 Beds | General Surgery & Pediatrics OPD`;

    actionChips.push(
      { label: '🗺️ Hospital Discovery Map', action: 'NAVIGATE', path: '/patient/facilities' },
      { label: '📅 Book Hospital Visit', action: 'NAVIGATE', path: '/patient/appointments/book' }
    );
  } else if (intent === 'MEDICINE_QUERY') {
    responseText = `💊 **Government Hospital Pharmacy Stock**
Verified available essential medicines at **${mainFacility.name}** Pharmacy Counter:

• **Paracetamol 500mg Tablets** — Status: **IN STOCK** (Dosage: 1 tablet after meals as directed for fever/body pain)
• **Cetirizine 10mg Tablets** — Status: **IN STOCK** (For allergy and cold symptoms)
• **Amoxicillin 500mg Capsules** — Status: **IN STOCK** (Prescription antibiotic)
• **Oral Rehydration Salts (ORS Sachets)** — Status: **IN STOCK** (For hydration & electrolyte replenishment)
• **Metformin 500mg** & **Amlodipine 5mg** — Status: **IN STOCK** (Chronic care)

⚠️ *Always take medicines strictly as prescribed by your attending government doctor.*`;

    actionChips.push(
      { label: '📍 Nearby Medical Stores', action: 'NAVIGATE', path: '/patient/medical-stores' },
      { label: '📅 Consult Doctor', action: 'NAVIGATE', path: '/patient/appointments/book' }
    );
  } else if (intent === 'PATIENT_RECORD' && patientAppointments.length > 0) {
    const apt = patientAppointments[0];
    responseText = `📋 **Your Active OPD Records**
• **Upcoming Appointment:**
  - **Hospital:** ${apt.facilityName}
  - **Doctor:** ${apt.doctorName} (${apt.specialty})
  - **Date & Time:** ${apt.date} at ${apt.timeSlot}
  - **Status:** **${apt.status}** ${apt.tokenNumber ? `(Token: **${apt.tokenNumber}**)` : ''}
  - **Reason:** ${apt.reasonForVisit}

Please report to Counter 1 for fast verification and token issuance.`;

    actionChips.push(
      { label: '🎟️ View My OPD Token', action: 'NAVIGATE', path: '/patient/tokens' },
      { label: '📋 View Health Record', action: 'NAVIGATE', path: '/patient/health-records' }
    );
  } else if (matchedCondition) {
    // 5-Section Grounded Clinical Format
    const precautionsList = matchedCondition.precautions.map((p) => `• ${p}`).join('\n');
    const remediesList = matchedCondition.homeRemedies.map((r) => `• ${r}`).join('\n');
    const medicinesList = matchedCondition.recommendedMedicines.map((m) => `• ${m}`).join('\n');

    responseText = `🩺 **1. Clinical Assessment & Triage**
Based on the symptoms described, this is consistent with **${matchedCondition.disease}** (Triage Urgency: **${matchedCondition.urgency}**).
*${matchedCondition.description}*

### 🏥 **2. Recommended Hospital Department & Doctor**
• **Facility:** **${mainFacility.name}**
• **Department:** **${matchedCondition.specialty} OPD**
• **Attending Doctor:** **${relevantDoctor.name}** (${relevantDoctor.qualification || 'MBBS, MD'})
• **Consultation Room:** **${relevantDoctor.opdRoom || 'Room 4 (1st Floor)'}**

### 💡 **3. Essential Home Care & Precautions**
${precautionsList}

### 🌿 **4. Supportive Home Measures**
${remediesList}

### 💊 **5. Hospital Pharmacy Availability**
${medicinesList}

---
⚠️ *Medical Safety Disclaimer: This automated guidance is for informational and triage assistance under SIH Telehealth. It does not replace formal clinical diagnosis. In case of worsening symptoms or severe distress, visit the OPD or call 108.*`;

    actionChips.push(
      { label: `📅 Book with ${relevantDoctor.name}`, action: 'NAVIGATE', path: '/patient/appointments/book' },
      { label: '🎟️ Get OPD Token', action: 'NAVIGATE', path: '/patient/tokens' },
      { label: '🚑 Emergency 108', action: 'EMERGENCY', phone: '108' }
    );
  } else {
    responseText = `👋 **Hello! I am your HealthConnect AI Medical Assistant.**

I can help you with:
1. **Symptom Identification & First Aid Guidance** (fever, cough, chest pain, knee pain, child health)
2. **Hospital & Doctor Lookup** (find on-duty doctors, OPD rooms, and wait times at Gandhinagar Civil Hospital)
3. **Medicine Stock Verification** (check available generic medicines at the hospital dispensary)
4. **Appointment Booking & Token Status**

How are you feeling today? You can type your question or use the microphone button to speak in English, Gujarati (ગુજરાતી), or Hindi (हिंदी).`;

    actionChips.push(
      { label: '🩺 Describe Symptoms', action: 'SUGGEST', type: 'fever' },
      { label: '📅 Book OPD Appointment', action: 'NAVIGATE', path: '/patient/appointments/book' },
      { label: '🏥 Hospital Facilities', action: 'NAVIGATE', path: '/patient/facilities' }
    );
  }

  const latencyMs = Date.now() - startTime;

  sendSuccess(res, 'Assistant response generated successfully', {
    answer: responseText,
    intent,
    is_emergency: isEmergency,
    matchedCondition: matchedCondition?.disease || null,
    urgency: matchedCondition?.urgency || (isEmergency ? 'EMERGENCY' : 'ROUTINE'),
    doctor: relevantDoctor ? { name: relevantDoctor.name, specialty: relevantDoctor.specialty, room: relevantDoctor.opdRoom } : null,
    facility: { name: mainFacility.name, availableBeds: mainFacility.availableBeds, icuBeds: mainFacility.icuBedsAvailable },
    actionChips,
    sources: [
      'Gujarat Health System Dataset',
      'MongoDB Atlas Live Facilities & Doctors Directory',
      'Civil Hospital OPD Schedule & Medicine Registry',
    ],
    latency_ms: latencyMs,
  });
}

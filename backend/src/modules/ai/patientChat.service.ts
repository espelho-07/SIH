import { env } from '../../config/env';
import { Hospital } from '../../models/Hospital';
import { Doctor } from '../../models/Doctor';
import { HospitalService as HospitalServiceModel } from '../../models/HospitalService';
import { Referral } from '../../models/Referral';
import { Patient } from '../../models/Patient';
import { User } from '../../models/User';
import { calculateHaversineDistance } from '../../utils/distance';

export interface LocationInput {
  latitude: number;
  longitude: number;
}

export interface HospitalRecommendation {
  hospitalId: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  distanceKm?: number;
  specialties: string[];
  emergencyAvailable: boolean;
  openingTime?: string;
  closingTime?: string;
  availableDoctorCount?: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ReferralDetails {
  referralId: string;
  referringFacilityName: string;
  receivingFacilityName: string;
  referringDoctorName: string;
  targetSpecialty: string;
  reason: string;
  urgency: string;
  status: string;
  createdAt: string;
}

export interface PatientChatResponse {
  message: string;
  intent: 'NEARBY_HOSPITALS' | 'SPECIALTY_DOCTOR' | 'REFERRAL_INFO' | 'GENERAL_HEALTH' | 'EMERGENCY';
  recommendations: HospitalRecommendation[];
  referral?: ReferralDetails;
  emergencyAlert: boolean;
  locationUsed: boolean;
}

export class PatientChatService {
  async processPatientChat(
    userId: string,
    userRole: string,
    message: string,
    location?: LocationInput
  ): Promise<PatientChatResponse> {
    const textLower = message.toLowerCase();

    // 1. Check Emergency Red Flags
    const emergencyPatterns = [
      /chest pain|heart attack|angina|severe breath|chhati/i,
      /unconscious|fainted|loss of consciousness|befan/i,
      /severe bleeding|profuse bleeding|khoon/i,
      /stroke|paralysis|seizure|convulsion/i,
    ];
    const isEmergency = emergencyPatterns.some((pattern) => pattern.test(textLower));

    // 2. Classify Intent
    const isReferralQuery = /referral|referred|refer|my doctor sent|doctor referred/i.test(textLower);
    const isSpecialtyQuery = /cardiologist|cardiology|skin|dermatologist|orthopedic|pediatric|gynecologist|eye|neurologist|gastroenterologist|doctor|daktar|vaidya/i.test(textLower);
    const isSymptomQuery = /mathu|dukhe|tav|bukhar|khasi|pet|dard|headache|fever|cough|stomach|pain|sick/i.test(textLower);
    const isHospitalQuery = /hospital|clinic|phc|chc|facility|near me|nearest|emergency room|dava/i.test(textLower) || isSpecialtyQuery || isSymptomQuery;

    let intent: PatientChatResponse['intent'] = 'GENERAL_HEALTH';
    if (isEmergency) intent = 'EMERGENCY';
    else if (isReferralQuery) intent = 'REFERRAL_INFO';
    else if (isSpecialtyQuery) intent = 'SPECIALTY_DOCTOR';
    else if (isHospitalQuery) intent = 'NEARBY_HOSPITALS';

    // 3. Database RAG Context Gathering
    let dbContextText = '';
    const recommendations: HospitalRecommendation[] = [];
    let referralData: ReferralDetails | undefined;

    // --- A. REFERRAL RETRIEVAL ---
    if (isReferralQuery || intent === 'REFERRAL_INFO') {
      let patient = await Patient.findOne({ userId });
      if (!patient) {
        const userObj = await User.findById(userId);
        if (userObj) {
          patient = await Patient.findOne({ phone: userObj.email }) || await Patient.findOne({ name: userObj.name });
        }
      }

      const patientFilter = patient ? { patientId: patient._id } : {};
      const referrals = await Referral.find(patientFilter)
        .populate('referringFacilityId', 'name address type phone')
        .populate('receivingFacilityId', 'name address type phone')
        .populate('referringDoctorId', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(3);

      if (referrals.length > 0) {
        const primaryRef = referrals[0];
        const referringFacility = (primaryRef.referringFacilityId as any)?.name || 'Referring Center';
        const receivingFacility = (primaryRef.receivingFacilityId as any)?.name || 'Receiving Hospital';
        const doctorName = (primaryRef.referringDoctorId as any)?.name || 'Referring Medical Officer';

        referralData = {
          referralId: primaryRef._id.toString(),
          referringFacilityName: referringFacility,
          receivingFacilityName: receivingFacility,
          referringDoctorName: doctorName,
          targetSpecialty: primaryRef.targetSpecialty,
          reason: primaryRef.reason,
          urgency: primaryRef.urgency,
          status: primaryRef.status,
          createdAt: primaryRef.createdAt.toISOString().split('T')[0],
        };

        dbContextText += `\n[VERIFIED PATIENT REFERRAL DATA]\n`;
        dbContextText += `- Referral Status: ${primaryRef.status}\n`;
        dbContextText += `- Referred To Hospital: ${receivingFacility}\n`;
        dbContextText += `- Referred From Facility: ${referringFacility}\n`;
        dbContextText += `- Referring Doctor: ${doctorName}\n`;
        dbContextText += `- Specialty Required: ${primaryRef.targetSpecialty}\n`;
        dbContextText += `- Reason for Referral: ${primaryRef.reason}\n`;
        dbContextText += `- Urgency Level: ${primaryRef.urgency}\n`;
        dbContextText += `- Date Created: ${referralData.createdAt}\n`;
      } else {
        dbContextText += `\n[PATIENT REFERRAL DATA]\nNo active hospital referrals found in the system for this patient.\n`;
      }
    }

    // --- B. HOSPITAL & DOCTOR RECOMMENDATION RETRIEVAL ---
    if (isHospitalQuery || isSpecialtyQuery || isSymptomQuery || intent === 'NEARBY_HOSPITALS' || intent === 'SPECIALTY_DOCTOR' || isEmergency) {
      let targetSpecialty: string | null = null;
      if (textLower.includes('cardio') || textLower.includes('heart')) targetSpecialty = 'Cardiology';
      else if (textLower.includes('skin') || textLower.includes('derm')) targetSpecialty = 'Dermatology';
      else if (textLower.includes('ortho') || textLower.includes('bone')) targetSpecialty = 'Orthopedics';
      else if (textLower.includes('pedia') || textLower.includes('child')) targetSpecialty = 'Pediatrics';
      else if (textLower.includes('gyno') || textLower.includes('women') || textLower.includes('maternity')) targetSpecialty = 'Obstetrics & Gynecology';
      else if (textLower.includes('neuro') || textLower.includes('brain') || textLower.includes('mathu')) targetSpecialty = 'General Medicine';

      const allHospitals = await Hospital.find({ isActive: true }).lean();
      const allDoctors = await Doctor.find({ isActive: true }).lean();
      const allServices = await HospitalServiceModel.find({ isAvailable: true }).lean();

      const hospitalDoctorMap = new Map<string, any[]>();
      allDoctors.forEach((d) => {
        const hid = d.hospitalId.toString();
        if (!hospitalDoctorMap.has(hid)) hospitalDoctorMap.set(hid, []);
        hospitalDoctorMap.get(hid)!.push(d);
      });

      const hospitalServiceMap = new Map<string, string[]>();
      allServices.forEach((s) => {
        const hid = s.hospitalId.toString();
        if (!hospitalServiceMap.has(hid)) hospitalServiceMap.set(hid, []);
        hospitalServiceMap.get(hid)!.push(s.serviceName);
      });

      let scoredHospitals = allHospitals.map((hosp) => {
        const hid = hosp._id.toString();
        const docs = hospitalDoctorMap.get(hid) || [];
        const services = hospitalServiceMap.get(hid) || [];

        let distanceKm: number | undefined = undefined;
        if (location && location.latitude && location.longitude) {
          distanceKm = calculateHaversineDistance(
            location.latitude,
            location.longitude,
            hosp.latitude,
            hosp.longitude
          );
        }

        const specialties = Array.from(
          new Set([...docs.map((d) => d.specialization), ...services])
        );

        const availableDoctorCount = docs.filter((d) => d.availabilityStatus === 'AVAILABLE').length;

        return {
          hosp,
          distanceKm,
          specialties,
          availableDoctorCount,
          docs,
        };
      });

      if (targetSpecialty) {
        const filtered = scoredHospitals.filter((item) =>
          item.specialties.some((s) => s.toLowerCase().includes(targetSpecialty!.toLowerCase()))
        );
        if (filtered.length > 0) {
          scoredHospitals = filtered;
        }
      }

      if (location && location.latitude) {
        scoredHospitals.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      }

      const topHospitals = scoredHospitals.slice(0, 3);

      topHospitals.forEach((item) => {
        recommendations.push({
          hospitalId: item.hosp._id.toString(),
          name: item.hosp.name,
          type: item.hosp.type,
          address: item.hosp.address,
          phone: item.hosp.phone,
          distanceKm: item.distanceKm,
          specialties: item.specialties.length > 0 ? item.specialties : ['General Medicine'],
          emergencyAvailable: item.hosp.emergencyAvailable,
          openingTime: item.hosp.openingTime,
          closingTime: item.hosp.closingTime,
          availableDoctorCount: item.availableDoctorCount,
          location: {
            latitude: item.hosp.latitude,
            longitude: item.hosp.longitude,
          },
        });
      });

      dbContextText += `\n[VERIFIED DATABASE HOSPITALS & SERVICES]\n`;
      recommendations.forEach((h, idx) => {
        dbContextText += `${idx + 1}. Hospital Name: ${h.name} (${h.type})\n`;
        dbContextText += `   Address: ${h.address}, Phone: ${h.phone}\n`;
        if (h.distanceKm !== undefined) dbContextText += `   Distance from patient: ${h.distanceKm} km\n`;
        dbContextText += `   Specialties/Services: ${h.specialties.join(', ')}\n`;
        dbContextText += `   Emergency Services: ${h.emergencyAvailable ? 'Available (24/7)' : 'Standard'}\n`;
        dbContextText += `   Available Doctors: ${h.availableDoctorCount || 0}\n`;
      });
    }

    // 4. Construct Gemini Prompt
    const systemPrompt = `You are Sanjeevani AI Healthcare Assistant inside a government public healthcare system.

Language Instruction: Respond in the EXACT same language as the patient query (e.g. Gujarati if query is Gujarati/Gujlish, Hindi if Hindi, English if English).

STRICT SAFETY & ACCURACY RULES:
1. Base ALL hospital recommendations, doctor specialties, availability, and patient referrals strictly on the VERIFIED DATABASE CONTEXT supplied below.
2. NEVER invent or hallucinate any hospital names, doctor names, availability times, phone numbers, or referral information.
3. If database information is unavailable or empty for a request (e.g. no referral found), state clearly that the information is unavailable in the database.
4. Include a short medical disclaimer that you provide healthcare assistance and recommendations, not formal clinical diagnosis.
5. If emergency symptoms are described (e.g. chest pain, severe bleeding, breathing trouble), urge the patient to seek immediate emergency care or call local emergency services immediately.

PATIENT INQUIRY: "${message}"

PATIENT LOCATION GPS: ${location ? `Lat ${location.latitude}, Lon ${location.longitude}` : 'Not provided'}

${dbContextText}
`;

    // 5. Invoke Chatbot Service (Local Flask app on port 8080 or direct Gemini API)
    let aiMessage = '';

    // A. Attempt calling local Python Flask Chatbot Backend (http://127.0.0.1:8080/get)
    try {
      const flaskResponse = await fetch('http://127.0.0.1:8080/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `msg=${encodeURIComponent(message)}&language=auto`,
      });

      if (flaskResponse.ok) {
        const textRes = await flaskResponse.text();
        if (textRes && !textRes.startsWith('⚠️ Error:')) {
          aiMessage = textRes.trim();
        }
      }
    } catch (err: any) {
      // Flask server not active, proceeding to direct Gemini API
    }

    // B. Direct Gemini API call if local Flask did not return response
    if (!aiMessage) {
      const cleanApiKey = (env.GEMINI_API_KEY || '').replace(/['"]/g, '').trim();
      if (cleanApiKey && cleanApiKey !== 'AIzaSyMockGeminiKeyForLocalDev') {
        const modelsToTry = ['gemini-3.6-flash', 'gemini-1.5-flash-latest', 'gemini-2.5-flash', 'gemini-pro'];

        for (const modelName of modelsToTry) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }] }],
                }),
              }
            );

            if (response.ok) {
              const resData: any = await response.json();
              const candidates = resData?.candidates;
              if (candidates && candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
                aiMessage = candidates[0].content.parts[0].text;
                break;
              }
            } else {
              const errText = await response.text();
              console.warn(`Gemini model ${modelName} returned status ${response.status}:`, errText);
            }
          } catch (err: any) {
            console.warn(`Gemini API call to ${modelName} failed:`, err.message);
          }
        }
      }
    }

    if (!aiMessage) {
      if (isEmergency) {
        aiMessage = `🚨 **URGENT EMERGENCY ALERT**: Your message mentions potential emergency symptoms. Please seek immediate emergency medical treatment at the nearest hospital or contact local emergency services immediately.\n\nWe have located the nearest hospital facilities from our verified database for you below.`;
      } else if (isReferralQuery) {
        if (referralData) {
          aiMessage = `According to your verified medical records, your doctor referred you to **${referralData.receivingFacilityName}** for **${referralData.targetSpecialty}**.\n\n- **Status**: ${referralData.status}\n- **Reason**: ${referralData.reason}\n- **Urgency**: ${referralData.urgency}\n\nPlease view your referral details below for appointment tracking.`;
        } else {
          aiMessage = `I checked your medical profile in our application database, but no active hospital referrals were found. If you believe a doctor has referred you, please contact your healthcare provider or check back after registration.`;
        }
      } else if (recommendations.length > 0) {
        const nearest = recommendations[0];
        aiMessage = `Based on your request ${location ? 'and current location' : ''}, I found **${recommendations.length} verified hospitals** in our database.\n\n` +
          `The nearest facility is **${nearest.name}** (${nearest.type}) located ${nearest.distanceKm !== undefined ? `${nearest.distanceKm} km away` : nearest.address}, offering services in ${nearest.specialties.slice(0, 3).join(', ')}.\n\n` +
          `*Note: This recommendation is generated from active database records for guidance. Always consult a healthcare professional for diagnosis.*`;
      } else {
        aiMessage = `Hello! I am your Sanjeevani Healthcare Assistant. I can help you find nearby hospitals, check doctor specialties, track your hospital referrals, or answer general healthcare questions.\n\n*Please note: I provide healthcare guidance based on database records and cannot provide formal medical diagnoses.*`;
      }
    }

    return {
      message: aiMessage,
      intent,
      recommendations,
      referral: referralData,
      emergencyAlert: isEmergency,
      locationUsed: !!location,
    };
  }
}

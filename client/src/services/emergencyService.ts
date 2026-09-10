import type {
  EmergencyContact,
  EmergencyFacility,
  BloodStockItem,
  BloodGroup,
  BloodComponent,
  AmbulanceFleetInfo,
  RedFlagSymptom,
} from '@/types/emergency'

// 1. National & State Public Emergency Helplines
const EMERGENCY_HELPLINES: EmergencyContact[] = [
  {
    id: 'hl-108',
    helplineNumber: '108',
    title: 'Emergency Medical & Ambulance (108)',
    subtitle: 'National Ambulance Service (EMRI / NHM)',
    description: '24x7 Toll-free dispatch for road accidents, cardiac arrests, trauma, acute poisoning, and critical medical emergencies.',
    isNational: true,
    isTollFree: true,
    primaryBadge: '24x7 Immediate Dispatch',
    iconName: 'Ambulance',
    availability: 'Available 24x7 Across All Districts',
  },
  {
    id: 'hl-102',
    helplineNumber: '102',
    title: 'Maternal & Child Transport (102)',
    subtitle: 'Janani Shishu Suraksha Karyakram (JSSK)',
    description: 'Free dedicated transport for pregnant mothers in labor, post-delivery hospital-to-home returns, and sick neonates up to 1 year.',
    isNational: true,
    isTollFree: true,
    primaryBadge: '100% Free Maternal Care',
    iconName: 'Baby',
    availability: '24x7 Dedicated Service',
  },
  {
    id: 'hl-112',
    helplineNumber: '112',
    title: 'Unified National Emergency (112)',
    subtitle: 'Emergency Response Support System (ERSS)',
    description: 'Single national emergency number for simultaneous coordination between Police, Fire, Disaster, and Medical services.',
    isNational: true,
    isTollFree: true,
    primaryBadge: 'Unified Emergency',
    iconName: 'ShieldAlert',
    availability: '24x7 All-India Unified',
  },
  {
    id: 'hl-104',
    helplineNumber: '104',
    title: 'State Health Information & Advice (104)',
    subtitle: 'Medical Guidance & Tele-Triage Helpline',
    description: 'Registered medical officer counseling for non-fatal symptoms, disease advisories, hospital locations, and public healthcare entitlements.',
    isNational: false,
    isTollFree: true,
    primaryBadge: 'Clinical Tele-Advice',
    iconName: 'PhoneCall',
    availability: '24x7 Medical Advice',
  },
  {
    id: 'hl-1075',
    helplineNumber: '1075',
    title: 'National Health Helpline (1075)',
    subtitle: 'Ministry of Health & Family Welfare (MoHFW)',
    description: 'Central government public health advisory helpline for infectious disease outbreaks, epidemic reporting, and national healthcare schemes.',
    isNational: true,
    isTollFree: true,
    primaryBadge: 'MoHFW Central',
    iconName: 'Building2',
    availability: '08:00 AM - 08:00 PM',
  },
]

// 2. Emergency Public Facilities in Varanasi District
const EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: 'fac-bhu-ssh',
    name: 'Sir Sunderlal Hospital & Trauma Centre, IMS BHU',
    ownership: 'GOVERNMENT',
    tier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi, Uttar Pradesh 221005',
    distanceKm: 7.2,
    estimatedTravelTimeMins: 24,
    phone: '+91 542 236 9251',
    emergencyHelpline: '108',
    operatingHours: '24x7 Level-1 Trauma & Emergency Centre',
    hasEmergency24x7: true,
    hasTraumaCenter: true,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 80, available: 11, occupied: 65, reserved: 4 },
    oxygenBeds: { total: 220, available: 38, occupied: 175, reserved: 7 },
    bloodBankAvailable: true,
    bloodUnitsTotal: 142,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 6).toISOString(), // 6 mins ago
    isStale: false,
    freshnessLabel: 'Updated 6 min ago',
    onDutyEmergencyDoctor: 'Dr. Vivek Pathak (Chief Trauma Surgeon, MS MCh)',
  },
  {
    id: 'fac-varanasi-dh',
    name: 'Pandit Deendayal Upadhyay District Hospital',
    ownership: 'GOVERNMENT',
    tier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    distanceKm: 3.8,
    estimatedTravelTimeMins: 14,
    phone: '+91 542 250 2841',
    emergencyHelpline: '108',
    operatingHours: '24x7 Casualty, Emergency & Inpatient Care',
    hasEmergency24x7: true,
    hasTraumaCenter: true,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 24, available: 6, occupied: 16, reserved: 2 },
    oxygenBeds: { total: 60, available: 19, occupied: 38, reserved: 3 },
    bloodBankAvailable: true,
    bloodUnitsTotal: 48,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 11).toISOString(), // 11 mins ago
    isStale: false,
    freshnessLabel: 'Updated 11 min ago',
    onDutyEmergencyDoctor: 'Dr. Anand Verma (Emergency Medical Officer, MD)',
  },
  {
    id: 'fac-varanasi-chc-shivpur',
    name: 'Community Health Centre (CHC) Shivpur',
    ownership: 'GOVERNMENT',
    tier: 'CHC',
    address: 'Near Central Jail Road, Shivpur, Varanasi 221003',
    distanceKm: 5.4,
    estimatedTravelTimeMins: 18,
    phone: '+91 542 228 1140',
    emergencyHelpline: '108',
    operatingHours: '24x7 Emergency Triage & First Referral Unit (FRU)',
    hasEmergency24x7: true,
    hasTraumaCenter: false,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 6, available: 2, occupied: 4, reserved: 0 },
    oxygenBeds: { total: 20, available: 7, occupied: 12, reserved: 1 },
    bloodBankAvailable: true,
    bloodUnitsTotal: 12,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago
    isStale: false,
    freshnessLabel: 'Updated 20 min ago',
    onDutyEmergencyDoctor: 'Dr. Ramesh Chandra (General Surgeon, MBBS MS)',
  },
  {
    id: 'fac-varanasi-phc-kashi',
    name: 'Primary Health Centre (PHC) Kashi Vidyapeeth',
    ownership: 'GOVERNMENT',
    tier: 'PHC',
    address: 'Manduadih Road, Varanasi 221103',
    distanceKm: 2.9,
    estimatedTravelTimeMins: 10,
    phone: '+91 542 237 0041',
    emergencyHelpline: '108',
    operatingHours: '08:00 AM - 02:00 PM (Emergency stabilized via 108 transit)',
    hasEmergency24x7: false,
    hasTraumaCenter: false,
    operationalStatus: 'OPERATIONAL',
    icuBeds: { total: 0, available: 0, occupied: 0, reserved: 0 },
    oxygenBeds: { total: 4, available: 2, occupied: 2, reserved: 0 },
    bloodBankAvailable: false,
    bloodUnitsTotal: 0,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 45 min ago',
    onDutyEmergencyDoctor: 'Dr. K. N. Mishra (Medical Officer, MBBS)',
  },
]

// 3. Verified Blood Bank Inventories Across Varanasi Public Hubs
const MOCK_BLOOD_STOCK: BloodStockItem[] = [
  // Sir Sunderlal Hospital IMS BHU Regional Blood Centre
  {
    id: 'bld-bhu-op-prbc',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'O+',
    component: 'PRBC',
    unitsAvailable: 28,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'NAT Tested, HIV/HCV/HBV Negative Screened',
    donationContact: 'Walk-in voluntary donors accepted 24x7 at BHU Blood Bank',
  },
  {
    id: 'bld-bhu-op-wb',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'O+',
    component: 'WHOLE_BLOOD',
    unitsAvailable: 14,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'NAT Tested, NABL Accredited',
    donationContact: 'Walk-in voluntary donors accepted 24x7',
  },
  {
    id: 'bld-bhu-bp-prbc',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'B+',
    component: 'PRBC',
    unitsAvailable: 32,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'NAT Tested, NABL Accredited',
    donationContact: 'Walk-in voluntary donors accepted 24x7',
  },
  {
    id: 'bld-bhu-ap-prbc',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'A+',
    component: 'PRBC',
    unitsAvailable: 22,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'NAT Tested, NABL Accredited',
    donationContact: 'Walk-in voluntary donors accepted 24x7',
  },
  {
    id: 'bld-bhu-abp-prbc',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'AB+',
    component: 'PRBC',
    unitsAvailable: 10,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'NAT Tested, NABL Accredited',
    donationContact: 'Walk-in voluntary donors accepted 24x7',
  },
  {
    id: 'bld-bhu-on-prbc',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'O-',
    component: 'PRBC',
    unitsAvailable: 4,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'Rare Universal Donor Bank (Cold-chain locked)',
    donationContact: 'Emergency donor call register maintained',
  },
  {
    id: 'bld-bhu-plt',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU Regional Blood Centre',
    facilityTier: 'TERTIARY_AIIMS',
    address: 'BHU Main Campus, Varanasi',
    distanceKm: 7.2,
    contactPhone: '+91 542 236 9251',
    bloodGroup: 'O+',
    component: 'PLATELETS',
    unitsAvailable: 8,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
    testingStandard: 'Platelet Agitator 22°C Monitored',
    donationContact: 'Apheresis platelet donation facility active',
  },

  // Pandit Deendayal Upadhyay District Hospital Blood Bank
  {
    id: 'bld-dh-op-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'O+',
    component: 'PRBC',
    unitsAvailable: 11,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'State Blood Transfusion Council Approved',
    donationContact: 'Voluntary Blood Donation Camp Mon/Thu',
  },
  {
    id: 'bld-dh-bp-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'B+',
    component: 'PRBC',
    unitsAvailable: 14,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'State Blood Transfusion Council Approved',
    donationContact: 'Contact blood bank officer on duty',
  },
  {
    id: 'bld-dh-ap-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'A+',
    component: 'PRBC',
    unitsAvailable: 8,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'ELISA Tested, Component Separator Unit',
    donationContact: 'Contact blood bank officer on duty',
  },
  {
    id: 'bld-dh-on-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'O-',
    component: 'PRBC',
    unitsAvailable: 1,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'Emergency Trauma Reserve Only',
    donationContact: 'Requires replacement donor or CMO authorization',
  },
  {
    id: 'bld-dh-an-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'A-',
    component: 'PRBC',
    unitsAvailable: 2,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'ELISA Tested',
    donationContact: 'Contact blood bank officer on duty',
  },
  {
    id: 'bld-dh-bn-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'B-',
    component: 'PRBC',
    unitsAvailable: 1,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'ELISA Tested',
    donationContact: 'Contact blood bank officer on duty',
  },
  {
    id: 'bld-dh-abn-prbc',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Pandeypur Blood Bank',
    facilityTier: 'DISTRICT_HOSPITAL',
    address: 'Pandeypur, Varanasi',
    distanceKm: 3.8,
    contactPhone: '+91 542 250 2841',
    bloodGroup: 'AB-',
    component: 'PRBC',
    unitsAvailable: 0,
    isLive: true,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 30 min ago',
    testingStandard: 'Stock depleted',
    donationContact: 'Call blood helpline to request donor activation',
  },

  // CHC Shivpur Blood Storage Centre (FRU Level) - 14 Hours Old Telemetry to demonstrate Stale Warning
  {
    id: 'bld-chc-op-wb',
    facilityId: 'fac-varanasi-chc-shivpur',
    facilityName: 'CHC Shivpur First Referral Blood Storage Unit',
    facilityTier: 'CHC',
    address: 'Near Central Jail Road, Shivpur, Varanasi',
    distanceKm: 5.4,
    contactPhone: '+91 542 228 1140',
    bloodGroup: 'O+',
    component: 'WHOLE_BLOOD',
    unitsAvailable: 3,
    isLive: false,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    isStale: true,
    freshnessLabel: 'Updated 14 hours ago — Call facility to confirm',
    testingStandard: 'Linked to District Hospital Cold Chain',
    donationContact: 'Transfusion unit for obstetric & trauma stabilization',
  },
  {
    id: 'bld-chc-bp-wb',
    facilityId: 'fac-varanasi-chc-shivpur',
    facilityName: 'CHC Shivpur First Referral Blood Storage Unit',
    facilityTier: 'CHC',
    address: 'Near Central Jail Road, Shivpur, Varanasi',
    distanceKm: 5.4,
    contactPhone: '+91 542 228 1140',
    bloodGroup: 'B+',
    component: 'WHOLE_BLOOD',
    unitsAvailable: 4,
    isLive: false,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    isStale: true,
    freshnessLabel: 'Updated 14 hours ago — Call facility to confirm',
    testingStandard: 'Linked to District Hospital Cold Chain',
    donationContact: 'Transfusion unit for obstetric & trauma stabilization',
  },
]

// 4. Authorized Public Ambulance & Transport Intelligence
const AMBULANCE_FLEETS: AmbulanceFleetInfo[] = [
  {
    id: 'amb-108-als',
    providerName: '108 National Ambulance Service (ALS)',
    serviceType: 'ALS',
    typeLabel: 'Advanced Life Support (ALS) Ambulance',
    coverageDistrict: 'Varanasi District & Highway Corridors',
    dispatchHelpline: '108',
    operatingHours: '24x7 Active Regional Tele-Dispatch',
    isZeroChargeGuaranteed: true,
    schemeName: 'National Health Mission (NHM) Government Service',
    capabilities: [
      'Transport ventilator & high-flow oxygen',
      'Defibrillator / External Cardiac Pacer',
      'Multipara monitor (ECG, NIBP, SpO2, EtCO2)',
      'Emergency IV resuscitation & cardiac medication kit',
    ],
    dispatchNote: 'Dispatched through District 108 Emergency Command Center. No GPS simulation is generated: dispatch officer confirms deployment details verbally.',
    onboardEquipment: [
      'Hamilton-T1 Transport Ventilator',
      'Zoll M Series Defibrillator',
      'Vacuum Spine Board & Cervical Collar Set',
    ],
    triageInstruction: 'Recommended for unconsciousness, polytrauma, suspected acute coronary syndrome, and respiratory failure.',
  },
  {
    id: 'amb-108-bls',
    providerName: '108 National Ambulance Service (BLS)',
    serviceType: 'BLS',
    typeLabel: 'Basic Life Support (BLS) Ambulance',
    coverageDistrict: 'Varanasi Urban & Rural Blocks',
    dispatchHelpline: '108',
    operatingHours: '24x7 Active Tele-Dispatch',
    isZeroChargeGuaranteed: true,
    schemeName: 'National Health Mission (NHM)',
    capabilities: [
      'Medical oxygen therapy cylinder',
      'Suction apparatus & airway adjuncts',
      'Fracture splinting & folding stretcher',
      'Trained Emergency Medical Technician (EMT)',
    ],
    dispatchNote: 'Zero fees for all patients to any government healthcare facility. Dial 108 for immediate triage and vehicle dispatch.',
    onboardEquipment: [
      'Dual Oxygen Cylinders (D-Type)',
      'Pediatric & Adult Resuscitation Bags',
      'First Aid & Burn Dressing Kit',
    ],
    triageInstruction: 'Suitable for stable patients requiring oxygen support or supine transfer to hospital emergency casualty.',
  },
  {
    id: 'amb-102-jssk',
    providerName: '102 Janani Shishu Suraksha Vahan',
    serviceType: 'MATERNAL_INFANT',
    typeLabel: 'Maternal & Neonatal Transport (102)',
    coverageDistrict: 'All Varanasi PHCs, CHCs & District Hospitals',
    dispatchHelpline: '102',
    operatingHours: '24x7 Free Maternal Transport',
    isZeroChargeGuaranteed: true,
    schemeName: 'Janani Shishu Suraksha Karyakram (JSSK)',
    capabilities: [
      'Free transport from home to public hospital for delivery',
      'Inter-facility transfer for maternal complications',
      'Drop-back transport to home after delivery (48 hours stay)',
      'Transport for sick infants up to 1 year of age',
    ],
    dispatchNote: 'Dedicated zero-charge scheme for expectant mothers and neonates. No payment is required under any circumstance.',
    onboardEquipment: [
      'Maternal Comfort Stretcher',
      'Neonatal Resuscitation Pack',
      'Sterile Delivery Emergency Kit',
    ],
    triageInstruction: 'Recommended for labor pain, high-risk pregnancy transfer, and neonatal emergency care.',
  },
]

// 5. Recognized Red-Flag Symptoms Prompting Immediate 108 Dispatch
const RED_FLAG_SYMPTOMS: RedFlagSymptom[] = [
  {
    id: 'rf-cardiac',
    symptom: 'Chest Pain, Heavy Squeezing, or Left Arm Radiating Discomfort',
    clinicalRisk: 'Potential Acute Coronary Syndrome / Myocardial Infarction',
    immediateAction: 'Call 108 immediately. Keep patient seated at rest. Do not let patient walk or exert.',
    recommendedFacilityType: 'Tertiary Medical College / District Hospital with active Cath Lab & CCU',
  },
  {
    id: 'rf-stroke',
    symptom: 'Sudden Facial Droop, Arm Weakness, or Slurred Speech (F.A.S.T.)',
    clinicalRisk: 'Acute Ischemic or Hemorrhagic Stroke (Golden Hour window)',
    immediateAction: 'Dial 108. Note the exact time symptoms started. Reach a CT-scan equipped public hospital within 3 hours.',
    recommendedFacilityType: 'Tertiary Hospital with 24x7 CT Scanner & Neuro ICU',
  },
  {
    id: 'rf-trauma',
    symptom: 'Severe Road Accident, Deep Laceration, or Major Blood Loss',
    clinicalRisk: 'Hypovolemic Shock, Traumatic Brain Injury, Internal Bleeding',
    immediateAction: 'Dial 108. Apply direct firm pressure to bleeding sites with clean cloth. Do not move spine if spinal injury suspected.',
    recommendedFacilityType: 'Designated Level-1 Trauma Centre',
  },
  {
    id: 'rf-breathing',
    symptom: 'Severe Shortness of Breath, Gasping, or Cyanosis (Bluish Lips)',
    clinicalRisk: 'Acute Respiratory Failure, Severe Pulmonary Edema, Status Asthmaticus',
    immediateAction: 'Dial 108. Sit patient upright. Loosen tight clothing. Prepare immediate oxygen transfer.',
    recommendedFacilityType: 'Hospital with High-Flow Oxygen & ICU capability',
  },
  {
    id: 'rf-obstetric',
    symptom: 'Severe Labor Pain, Heavy Vaginal Bleeding, or Convulsions in Pregnancy',
    clinicalRisk: 'Eclampsia, Placental Abruption, Obstructed Labor',
    immediateAction: 'Dial 102 or 108. Lie patient on her left side. Rush to nearest First Referral Unit (FRU) with Cesarean capability.',
    recommendedFacilityType: 'CHC FRU or District Women Hospital with Blood Bank',
  },
  {
    id: 'rf-unconscious',
    symptom: 'Loss of Consciousness, Severe Drowsiness, or Seizures',
    clinicalRisk: 'Neurological Collapse, Severe Metabolic Acidosis, Head Trauma',
    immediateAction: 'Dial 108. Turn patient to recovery position (on side) to prevent aspiration. Check breathing continuously.',
    recommendedFacilityType: 'Tertiary Emergency Ward with Ventilator Care',
  },
]

export const emergencyService = {
  /**
   * Retrieves verified national and state public healthcare emergency numbers.
   */
  async getEmergencyHelplines(): Promise<EmergencyContact[]> {
    await new Promise((res) => setTimeout(res, 80))
    return EMERGENCY_HELPLINES
  },

  /**
   * Retrieves public facilities equipped with 24x7 emergency casualty units.
   */
  async getEmergencyFacilities(params?: {
    district?: string
    onlyTrauma?: boolean
  }): Promise<EmergencyFacility[]> {
    await new Promise((res) => setTimeout(res, 120))
    let list = [...EMERGENCY_FACILITIES]

    if (params?.onlyTrauma) {
      list = list.filter((f) => f.hasTraumaCenter)
    }

    // Sort: 24x7 Emergency first, then proximity
    list.sort((a, b) => {
      if (a.hasEmergency24x7 && !b.hasEmergency24x7) return -1
      if (!a.hasEmergency24x7 && b.hasEmergency24x7) return 1
      return a.distanceKm - b.distanceKm
    })

    return list
  },

  /**
   * Searches live blood availability across verified public blood banks.
   */
  async getBloodAvailability(params?: {
    bloodGroup?: BloodGroup
    component?: BloodComponent
    searchQuery?: string
  }): Promise<BloodStockItem[]> {
    await new Promise((res) => setTimeout(res, 150))
    let results = [...MOCK_BLOOD_STOCK]

    if (params?.bloodGroup) {
      results = results.filter((b) => b.bloodGroup === params.bloodGroup)
    }

    if (params?.component) {
      results = results.filter((b) => b.component === params.component)
    }

    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase()
      results = results.filter(
        (b) =>
          b.facilityName.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.bloodGroup.toLowerCase().includes(q),
      )
    }

    // Sort: Highest units available first, then distance
    results.sort((a, b) => {
      if (a.isStale && !b.isStale) return 1
      if (!a.isStale && b.isStale) return -1
      if (b.unitsAvailable !== a.unitsAvailable) {
        return b.unitsAvailable - a.unitsAvailable
      }
      return a.distanceKm - b.distanceKm
    })

    return results
  },

  /**
   * Retrieves authorized 108/102 public ambulance fleets.
   */
  async getAmbulanceFleets(): Promise<AmbulanceFleetInfo[]> {
    await new Promise((res) => setTimeout(res, 90))
    return AMBULANCE_FLEETS
  },

  /**
   * Retrieves recognized red-flag symptoms prompting immediate emergency triage.
   */
  async getRedFlagSymptoms(): Promise<RedFlagSymptom[]> {
    await new Promise((res) => setTimeout(res, 60))
    return RED_FLAG_SYMPTOMS
  },

  /**
   * Client audit event logger for emergency access telemetry.
   */
  logEmergencyAction(actionName: string, metadata?: Record<string, unknown>): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: actionName,
        metadata: metadata || {},
      }
      const existing = JSON.parse(sessionStorage.getItem('healthconnect_emergency_audit') || '[]')
      existing.push(logEntry)
      sessionStorage.setItem('healthconnect_emergency_audit', JSON.stringify(existing.slice(-20)))
    } catch {
      // Non-blocking storage
    }
  },
}

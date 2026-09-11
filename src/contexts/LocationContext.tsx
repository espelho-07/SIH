import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationFacility {
  id: string;
  name: string;
  district: string;
  type: string;
  typeBadge: string;
  address: string;
  availableBeds?: number;
  emergency24x7: boolean;
}

export const GUJARAT_DISTRICTS = [
  'Gandhinagar',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
] as const;

export const AVAILABLE_HOSPITALS: LocationFacility[] = [
  // Gandhinagar
  {
    id: 'fac_civil_01',
    name: 'Gandhinagar Civil Hospital & Medical College',
    district: 'Gandhinagar',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Apex District Hospital',
    address: 'Sector 12, Near Bus Depot, Gandhinagar - 382012',
    availableBeds: 48,
    emergency24x7: true,
  },
  {
    id: 'fac_mansa_02',
    name: 'Mansa Community Health Centre (CHC)',
    district: 'Gandhinagar',
    type: 'CHC',
    typeBadge: 'Community Health Centre',
    address: 'Station Road, Mansa, Gandhinagar - 382845',
    availableBeds: 18,
    emergency24x7: true,
  },
  {
    id: 'fac_kalol_03',
    name: 'Kalol Sub-District Hospital',
    district: 'Gandhinagar',
    type: 'SUB_DISTRICT_HOSPITAL',
    typeBadge: 'Sub-District Hospital',
    address: 'Vakharia Chowk, Kalol, Gandhinagar - 382721',
    availableBeds: 22,
    emergency24x7: true,
  },
  {
    id: 'fac_pet_04',
    name: 'Pethapur Primary Health Centre (PHC)',
    district: 'Gandhinagar',
    type: 'PHC',
    typeBadge: 'Primary Health Centre',
    address: 'Near Old Gram Panchayat, Pethapur - 382610',
    availableBeds: 7,
    emergency24x7: false,
  },

  // Ahmedabad
  {
    id: 'fac_ahd_civil_01',
    name: 'Ahmedabad Civil Hospital & BJ Medical College',
    district: 'Ahmedabad',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Apex Super-Specialty',
    address: 'Asarwa, Ahmedabad - 380016',
    availableBeds: 180,
    emergency24x7: true,
  },
  {
    id: 'fac_ahd_sola_02',
    name: 'GMERS Medical College & Civil Hospital Sola',
    district: 'Ahmedabad',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Medical College & Hospital',
    address: 'SG Highway, Sola, Ahmedabad - 380060',
    availableBeds: 75,
    emergency24x7: true,
  },
  {
    id: 'fac_ahd_lg_03',
    name: 'LG Municipal General Hospital',
    district: 'Ahmedabad',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Municipal General Hospital',
    address: 'Maninagar, Ahmedabad - 380008',
    availableBeds: 54,
    emergency24x7: true,
  },
  {
    id: 'fac_ahd_sanand_04',
    name: 'Sanand Community Health Centre (CHC)',
    district: 'Ahmedabad',
    type: 'CHC',
    typeBadge: 'Community Health Centre',
    address: 'Near GIDC Gate, Sanand, Ahmedabad - 382110',
    availableBeds: 14,
    emergency24x7: true,
  },

  // Surat
  {
    id: 'fac_surat_civil_01',
    name: 'New Civil Hospital Surat (Govt Medical College)',
    district: 'Surat',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'District Hospital',
    address: 'Majura Gate, Surat - 395001',
    availableBeds: 110,
    emergency24x7: true,
  },
  {
    id: 'fac_surat_smimer_02',
    name: 'SMIMER Hospital & Municipal Medical College',
    district: 'Surat',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Municipal Hospital',
    address: 'Sahara Darwaja, Umarwada, Surat - 395010',
    availableBeds: 62,
    emergency24x7: true,
  },
  {
    id: 'fac_surat_bardoli_03',
    name: 'Sardar Smarak Sub-District Hospital',
    district: 'Surat',
    type: 'SUB_DISTRICT_HOSPITAL',
    typeBadge: 'Sub-District Hospital',
    address: 'Station Road, Bardoli, Surat - 394601',
    availableBeds: 28,
    emergency24x7: true,
  },

  // Vadodara
  {
    id: 'fac_vad_ssg_01',
    name: 'Sir Sayajirao General (SSG) Hospital',
    district: 'Vadodara',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Apex Medical College Hospital',
    address: 'Jail Road, Sayajigunj, Vadodara - 390001',
    availableBeds: 92,
    emergency24x7: true,
  },
  {
    id: 'fac_vad_padra_02',
    name: 'Padra Community Health Centre (CHC)',
    district: 'Vadodara',
    type: 'CHC',
    typeBadge: 'Community Health Centre',
    address: 'Station Road, Padra, Vadodara - 391440',
    availableBeds: 16,
    emergency24x7: true,
  },

  // Rajkot
  {
    id: 'fac_raj_civil_01',
    name: 'PDU Government Medical College & Civil Hospital',
    district: 'Rajkot',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Apex District Hospital',
    address: 'Hospital Chowk, Rajkot - 360001',
    availableBeds: 84,
    emergency24x7: true,
  },
  {
    id: 'fac_raj_gondal_02',
    name: 'Gondal Sub-District Hospital',
    district: 'Rajkot',
    type: 'SUB_DISTRICT_HOSPITAL',
    typeBadge: 'Sub-District Hospital',
    address: 'Gondal Bypass, Rajkot - 360311',
    availableBeds: 24,
    emergency24x7: true,
  },

  // Bhavnagar
  {
    id: 'fac_bhv_sirt_01',
    name: 'Sir Takhtasinhji (Sir T) Civil Hospital',
    district: 'Bhavnagar',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'District Hospital',
    address: 'Kalanala, Bhavnagar - 364001',
    availableBeds: 45,
    emergency24x7: true,
  },

  // Jamnagar
  {
    id: 'fac_jam_gg_01',
    name: 'Guru Gobind Singh (GG) Government Hospital',
    district: 'Jamnagar',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'Apex Teaching Hospital',
    address: 'Indira Marg, Jamnagar - 361008',
    availableBeds: 58,
    emergency24x7: true,
  },

  // Junagadh
  {
    id: 'fac_jun_civil_01',
    name: 'Junagadh Civil Hospital & GMERS College',
    district: 'Junagadh',
    type: 'DISTRICT_HOSPITAL',
    typeBadge: 'District Hospital',
    address: 'Majevadi Gate, Junagadh - 362001',
    availableBeds: 36,
    emergency24x7: true,
  },
];

interface LocationContextType {
  selectedDistrict: string;
  selectedFacility: string;
  selectedFacilityId: string;
  stateGrid: string;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setLocation: (district: string, facilityName: string, facilityId?: string) => void;
  detectGpsLocation: () => Promise<{ success: boolean; message: string }>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    return localStorage.getItem('healthconnect_district') || 'Gandhinagar';
  });

  const [selectedFacility, setSelectedFacility] = useState<string>(() => {
    return (
      localStorage.getItem('healthconnect_facility') ||
      'Gandhinagar Civil Hospital & Medical College'
    );
  });

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
    return localStorage.getItem('healthconnect_facility_id') || 'fac_civil_01';
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  const setLocation = (district: string, facilityName: string, facilityId?: string) => {
    setSelectedDistrict(district);
    setSelectedFacility(facilityName);
    const matched = facilityId || AVAILABLE_HOSPITALS.find((h) => h.name === facilityName)?.id || 'fac_civil_01';
    setSelectedFacilityId(matched);

    localStorage.setItem('healthconnect_district', district);
    localStorage.setItem('healthconnect_facility', facilityName);
    localStorage.setItem('healthconnect_facility_id', matched);
  };

  const detectGpsLocation = async (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, message: 'GPS is not supported by your browser.' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Approximate check:
          // Gandhinagar: ~23.2, 72.6
          // Ahmedabad: ~23.0, 72.5
          // Surat: ~21.1, 72.8
          // Vadodara: ~22.3, 73.1
          let detectedDistrict = 'Gandhinagar';
          let detectedHospital = 'Gandhinagar Civil Hospital & Medical College';
          let detectedId = 'fac_civil_01';

          if (latitude < 21.8 && longitude < 73.2) {
            detectedDistrict = 'Surat';
            detectedHospital = 'New Civil Hospital Surat (Govt Medical College)';
            detectedId = 'fac_surat_civil_01';
          } else if (latitude < 22.6 && longitude > 73.0) {
            detectedDistrict = 'Vadodara';
            detectedHospital = 'Sir Sayajirao General (SSG) Hospital';
            detectedId = 'fac_vad_ssg_01';
          } else if (latitude < 22.5 && longitude < 71.5) {
            detectedDistrict = 'Rajkot';
            detectedHospital = 'PDU Government Medical College & Civil Hospital';
            detectedId = 'fac_raj_civil_01';
          } else if (latitude < 23.12 && latitude > 22.8) {
            detectedDistrict = 'Ahmedabad';
            detectedHospital = 'Ahmedabad Civil Hospital & BJ Medical College';
            detectedId = 'fac_ahd_civil_01';
          }

          setLocation(detectedDistrict, detectedHospital, detectedId);
          resolve({
            success: true,
            message: `Detected nearest medical center: ${detectedHospital} (${detectedDistrict})`,
          });
        },
        (error) => {
          resolve({
            success: false,
            message: error.message || 'Unable to access your GPS position. Please choose manually.',
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedDistrict,
        selectedFacility,
        selectedFacilityId,
        stateGrid: 'Gujarat Public Health Grid',
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
        setLocation,
        detectGpsLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export interface Patient {
  id: string;
  id_number: string;
  name: string;
  family_name: string;
  height: number | '';
}

export interface PatientInfo {
  idNumber: string;
  name: string;
  familyName: string;
}

export interface MaternalInfo {
  age: number | '';
  bmi: number | '';
  height: number | '';
  weightBeforePregnancy: number | '';
  currentWeight: number | '';
  gdm: boolean;
  dm: boolean;
  smoking: boolean;
  alcohol: boolean;
  drugs: boolean;
}

export interface ObstetricHistory {
  gravida: number | '';
  para: number | '';
  abortions: number | '';
  cesareanSections: number | '';
  livingChildren: number | '';
  eup: number | '';
  vbac: number | '';
  pastBirthsAverageWeight: number | '';
}

export interface FetalBiometry {
  gestationalAge: number | '';
  efwUltrasound: number | '';
  clinicalEstimation: number | '';
  fetalSex: 0 | 1;
}

export interface PredictionData {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  patient?: Patient;
  maternalInfo: MaternalInfo;
  obstetricHistory: ObstetricHistory;
  fetalBiometry: FetalBiometry;
  predictedWeight: number;
  confidenceRange: {
    low: number;
    high: number;
  };
  shapExplanation: ShapFactor[];
  createdAt: Date;
  actualWeight?: number;
  deviationPercentage?: number;
}

export interface ShapFactor {
  factor: string;
  value: number;
  contribution: number;
  direction: 'positive' | 'negative';
}

export interface ValidationError {
  field: string;
  message: string;
}

export const initialMaternalInfo: MaternalInfo = {
  age: '',
  bmi: '',
  height: '',
  weightBeforePregnancy: '',
  currentWeight: '',
  gdm: false,
  dm: false,
  smoking: false,
  alcohol: false,
  drugs: false,
};

export const initialObstetricHistory: ObstetricHistory = {
  gravida: '',
  para: '',
  abortions: '',
  cesareanSections: '',
  livingChildren: '',
  eup: '',
  vbac: '',
  pastBirthsAverageWeight: '',
};

export const initialFetalBiometry: FetalBiometry = {
  gestationalAge: '',
  efwUltrasound: '',
  clinicalEstimation: '',
  fetalSex: 0,
};

export const initialPatientInfo: PatientInfo = {
  idNumber: '',
  name: '',
  familyName: '',
};

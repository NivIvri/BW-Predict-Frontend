import { supabase } from './supabase';
import { MaternalInfo, ObstetricHistory, FetalBiometry, PatientInfo, PredictionData, Patient, ShapFactor } from '@/types/prediction';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
  };
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function patch(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

async function del(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

// ── Map a raw DB row to the frontend PredictionData shape ───────────
function rowToPrediction(row: Record<string, unknown>): PredictionData {
  const patients = row.patients as Record<string, unknown> | null;
  const predicted = Number(row.predicted_birth_weight) || 0;

  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    doctor_id: row.doctor_id as string,
    patient: patients
      ? {
          id: patients.id as string,
          id_number: patients.id_number as string,
          name: patients.name as string,
          family_name: patients.family_name as string,
          height: (patients.height as number) ?? '',
        }
      : undefined,
    maternalInfo: {
      age: (row.age as number) ?? '',
      height: (patients?.height as number) ?? '',
      weightBeforePregnancy: (row.pre_pregnancy_weight as number) ?? '',
      currentWeight: (row.current_weight as number) ?? '',
      bmi: (row.bmi as number) ?? '',
      gdm: (row.gdm as boolean) ?? false,
      dm: (row.dm as boolean) ?? false,
      smoking: (row.smoking as boolean) ?? false,
      alcohol: (row.alcohol as boolean) ?? false,
      drugs: (row.drugs as boolean) ?? false,
    },
    obstetricHistory: {
      gravida: (row.g_count as number) ?? '',
      para: (row.p_count as number) ?? '',
      abortions: (row.ab_count as number) ?? '',
      cesareanSections: (row.cs_count as number) ?? '',
      livingChildren: (row.lc_count as number) ?? '',
      eup: (row.eup_count as number) ?? '',
      vbac: (row.vbac_count as number) ?? '',
      pastBirthsAverageWeight: (row.past_births_average_weight as number) ?? '',
    },
    fetalBiometry: {
      gestationalAge: row.gestational_age_days
        ? Math.round(Number(row.gestational_age_days) / 7)
        : '',
      efwUltrasound: (row.sonographic_weight_estimate as number) ?? '',
      clinicalEstimation: (row.clinical_weight_estimate as number) ?? '',
      fetalSex: ((row.fetal_sex as number) ?? 0) as 0 | 1,
    },
    predictedWeight: predicted,
    confidenceRange: {
      low: Math.round(predicted * 0.9),
      high: Math.round(predicted * 1.1),
    },
    shapExplanation: (row.shap_explanation as ShapFactor[]) ?? [],
    createdAt: new Date(row.created_at as string),
    actualWeight: (row.actual_birth_weight as number) ?? undefined,
    deviationPercentage: (row.prediction_error as number) ?? undefined,
  };
}

// ── Public API ──────────────────────────────────────────────────────

export async function apiLookupPatient(idNumber: string): Promise<Patient | null> {
  const { patient } = await post('/patients/lookup', { idNumber });
  if (!patient) return null;
  return {
    id: patient.id,
    id_number: patient.id_number,
    name: patient.name,
    family_name: patient.family_name,
    height: patient.height ?? '',
  };
}

export async function apiGetPredictions(): Promise<PredictionData[]> {
  const { predictions } = await get('/predictions');
  return (predictions as Record<string, unknown>[]).map(rowToPrediction);
}

export async function apiSubmitPrediction(
  patientInfo: PatientInfo,
  maternalInfo: MaternalInfo,
  obstetricHistory: ObstetricHistory,
  fetalBiometry: FetalBiometry
): Promise<PredictionData> {
  const { prediction } = await post('/predict', {
    patientInfo,
    maternalInfo,
    obstetricHistory,
    fetalBiometry,
  });
  return rowToPrediction(prediction as Record<string, unknown>);
}

export async function apiUpdateActualWeight(
  predictionId: string,
  actualWeight: number,
  predictedWeight: number
): Promise<number> {
  const { deviation } = await patch(`/predictions/${predictionId}/actual-weight`, {
    actualWeight,
    predictedWeight,
  });
  return deviation as number;
}

export async function apiClearPredictions(): Promise<void> {
  await del('/predictions');
}

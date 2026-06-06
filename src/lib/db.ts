import { supabase } from './supabase';
import {
  MaternalInfo,
  ObstetricHistory,
  FetalBiometry,
  PredictionData,
  Patient,
  ShapFactor,
} from '@/types/prediction';

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
      hc: (row.hc as number) ?? '',
      ac: (row.ac as number) ?? '',
      fl: (row.fl as number) ?? '',
      afi: (row.afi as number) ?? '',
      efwUltrasound: (row.sonographic_weight_estimate as number) ?? '',
      clinicalEstimation: (row.clinical_weight_estimate as number) ?? '',
      induction: (row.induction as boolean) ?? false,
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

export async function lookupPatient(idNumber: string): Promise<Patient | null> {
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id_number', idNumber)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    id_number: data.id_number,
    name: data.name,
    family_name: data.family_name,
    height: data.height ?? '',
  };
}

export async function getOrCreatePatient(
  idNumber: string,
  name: string,
  familyName: string,
  height: number
): Promise<Patient> {
  // Try to find existing patient first
  const existing = await lookupPatient(idNumber);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('patients')
    .insert({ id_number: idNumber, name, family_name: familyName, height })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    id_number: data.id_number,
    name: data.name,
    family_name: data.family_name,
    height: data.height ?? '',
  };
}

export async function createPrediction(
  patientId: string,
  doctorId: string,
  maternal: MaternalInfo,
  obstetric: ObstetricHistory,
  fetal: FetalBiometry,
  predictedWeight: number,
  shapExplanation: ShapFactor[]
): Promise<PredictionData> {
  const { data, error } = await supabase
    .from('predictions')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      age: Number(maternal.age) || null,
      pre_pregnancy_weight: Number(maternal.weightBeforePregnancy) || null,
      bmi: Number(maternal.bmi) || null,
      gestational_age_days: Number(fetal.gestationalAge) * 7 || null,
      smoking: maternal.smoking,
      alcohol: maternal.alcohol,
      drugs: maternal.drugs,
      gdm: maternal.gdm,
      dm: maternal.dm,
      g_count: Number(obstetric.gravida) || null,
      p_count: Number(obstetric.para) || null,
      ab_count: Number(obstetric.abortions) || null,
      cs_count: Number(obstetric.cesareanSections) || null,
      lc_count: Number(obstetric.livingChildren) || null,
      eup_count: Number(obstetric.eup) || null,
      vbac_count: Number(obstetric.vbac) || null,
      past_births_average_weight: Number(obstetric.pastBirthsAverageWeight) || null,
      hc: Number(fetal.hc) || null,
      ac: Number(fetal.ac) || null,
      fl: Number(fetal.fl) || null,
      afi: Number(fetal.afi) || null,
      induction: fetal.induction,
      sonographic_weight_estimate: Number(fetal.efwUltrasound) || null,
      clinical_weight_estimate: Number(fetal.clinicalEstimation) || null,
      predicted_birth_weight: predictedWeight,
      shap_explanation: shapExplanation,
    })
    .select('*, patients(*)')
    .single();

  if (error) throw new Error(error.message);
  return rowToPrediction(data as Record<string, unknown>);
}

export async function updateActualWeight(
  predictionId: string,
  actualWeight: number,
  predictedWeight: number
): Promise<void> {
  const deviation =
    Math.round(((predictedWeight - actualWeight) / actualWeight) * 1000) / 10;

  const { error } = await supabase
    .from('predictions')
    .update({
      actual_birth_weight: actualWeight,
      prediction_error: deviation,
      updated_at: new Date().toISOString(),
    })
    .eq('id', predictionId);

  if (error) throw new Error(error.message);
}

export async function getPredictions(doctorId: string): Promise<PredictionData[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, patients(*)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToPrediction(r as Record<string, unknown>));
}

export async function clearPredictions(doctorId: string): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('doctor_id', doctorId);

  if (error) throw new Error(error.message);
}

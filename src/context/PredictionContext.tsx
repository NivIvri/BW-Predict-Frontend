import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  PredictionData,
  MaternalInfo,
  ObstetricHistory,
  FetalBiometry,
  Patient,
  PatientInfo,
  initialMaternalInfo,
  initialObstetricHistory,
  initialFetalBiometry,
  initialPatientInfo,
} from '@/types/prediction';
import {
  apiLookupPatient,
  apiGetPredictions,
  apiSubmitPrediction,
  apiUpdateActualWeight,
  apiClearPredictions,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PredictionContextType {
  predictions: PredictionData[];
  currentStep: number;
  patientInfo: PatientInfo;
  foundPatient: Patient | null;
  maternalInfo: MaternalInfo;
  obstetricHistory: ObstetricHistory;
  fetalBiometry: FetalBiometry;
  currentPrediction: PredictionData | null;
  isLoading: boolean;
  setCurrentStep: (step: number) => void;
  setPatientInfo: (info: PatientInfo) => void;
  setFoundPatient: (patient: Patient | null) => void;
  setMaternalInfo: (info: MaternalInfo) => void;
  setObstetricHistory: (history: ObstetricHistory) => void;
  setFetalBiometry: (biometry: FetalBiometry) => void;
  lookupPatient: (idNumber: string) => Promise<Patient | null>;
  submitPrediction: () => Promise<PredictionData | null>;
  updateActualWeight: (id: string, weight: number) => Promise<void>;
  clearAllPredictions: () => Promise<void>;
  resetForm: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [maternalInfo, setMaternalInfo] = useState<MaternalInfo>(initialMaternalInfo);
  const [obstetricHistory, setObstetricHistory] = useState<ObstetricHistory>(initialObstetricHistory);
  const [fetalBiometry, setFetalBiometry] = useState<FetalBiometry>(initialFetalBiometry);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionData | null>(null);

  // Load predictions from backend when user signs in
  useEffect(() => {
    if (!user || user.id === 'dev-user') return;
    apiGetPredictions()
      .then(setPredictions)
      .catch(console.error);
  }, [user]);

  const lookupPatient = async (idNumber: string): Promise<Patient | null> => {
    const patient = await apiLookupPatient(idNumber);
    setFoundPatient(patient);
    if (patient) {
      setMaternalInfo(prev => ({ ...prev, height: patient.height }));
    }
    return patient;
  };

  const submitPrediction = async (): Promise<PredictionData | null> => {
    if (!user || user.id === 'dev-user') return null;
    setIsLoading(true);
    try {
      const saved = await apiSubmitPrediction(
        patientInfo,
        maternalInfo,
        obstetricHistory,
        fetalBiometry
      );
      setPredictions(prev => [saved, ...prev]);
      setCurrentPrediction(saved);
      return saved;
    } catch (error) {
      console.error('submitPrediction failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActualWeight = async (id: string, weight: number): Promise<void> => {
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    const deviation = await apiUpdateActualWeight(id, weight, prediction.predictedWeight);

    setPredictions(prev =>
      prev.map(p => p.id === id ? { ...p, actualWeight: weight, deviationPercentage: deviation } : p)
    );
    if (currentPrediction?.id === id) {
      setCurrentPrediction(prev =>
        prev ? { ...prev, actualWeight: weight, deviationPercentage: deviation } : prev
      );
    }
  };

  const clearAllPredictions = async (): Promise<void> => {
    if (!user || user.id === 'dev-user') return;
    await apiClearPredictions();
    setPredictions([]);
    setCurrentPrediction(null);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPatientInfo(initialPatientInfo);
    setFoundPatient(null);
    setMaternalInfo(initialMaternalInfo);
    setObstetricHistory(initialObstetricHistory);
    setFetalBiometry(initialFetalBiometry);
    setCurrentPrediction(null);
  };

  return (
    <PredictionContext.Provider
      value={{
        predictions,
        currentStep,
        patientInfo,
        foundPatient,
        maternalInfo,
        obstetricHistory,
        fetalBiometry,
        currentPrediction,
        isLoading,
        setCurrentStep,
        setPatientInfo,
        setFoundPatient,
        setMaternalInfo,
        setObstetricHistory,
        setFetalBiometry,
        lookupPatient,
        submitPrediction,
        updateActualWeight,
        clearAllPredictions,
        resetForm,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
}

export function usePrediction() {
  const context = useContext(PredictionContext);
  if (!context) throw new Error('usePrediction must be used within a PredictionProvider');
  return context;
}

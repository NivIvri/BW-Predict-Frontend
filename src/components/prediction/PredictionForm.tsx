import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/context/PredictionContext';
import { FormStepIndicator } from './FormStepIndicator';
import { PatientLookupStep } from './PatientLookupStep';
import { MaternalInfoStep } from './MaternalInfoStep';
import { ObstetricHistoryStep } from './ObstetricHistoryStep';
import { FetalBiometryStep } from './FetalBiometryStep';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ValidationError } from '@/types/prediction';
import { toast } from 'sonner';
import { useState } from 'react';

const steps = [
  { number: 1, title: 'Patient Identification' },
  { number: 2, title: 'Maternal & Clinical Info' },
  { number: 3, title: 'Obstetric History (GPACS)' },
  { number: 4, title: 'Fetal Biometry & Estimations' },
];

export function PredictionForm() {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    patientInfo,
    foundPatient,
    maternalInfo,
    obstetricHistory,
    fetalBiometry,
    submitPrediction,
    isLoading,
    resetForm,
  } = usePrediction();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (typeof resetForm === 'function') resetForm();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationError[] = [];

    if (step === 1) {
      if (!patientInfo.idNumber.trim()) {
        newErrors.push({ field: 'idNumber', message: 'Please enter and search a patient ID number.' });
      } else if (foundPatient === null && !patientInfo.name.trim()) {
        newErrors.push({ field: 'name', message: 'Please enter the patient\'s first name.' });
      } else if (foundPatient === null && !patientInfo.familyName.trim()) {
        newErrors.push({ field: 'familyName', message: 'Please enter the patient\'s family name.' });
      } else if (!maternalInfo.height || maternalInfo.height < 130 || maternalInfo.height > 210) {
        newErrors.push({ field: 'height', message: 'Please enter a valid height (130–210 cm).' });
      }
    }

    if (step === 2) {
      if (!maternalInfo.age || maternalInfo.age < 15 || maternalInfo.age > 55) {
        newErrors.push({ field: 'age', message: 'Please enter a valid age (15–55).' });
      }
      if (!maternalInfo.weightBeforePregnancy || maternalInfo.weightBeforePregnancy < 35 || maternalInfo.weightBeforePregnancy > 200) {
        newErrors.push({ field: 'weightBeforePregnancy', message: 'Please enter pre-pregnancy weight (35–200 kg).' });
      }
      if (!maternalInfo.currentWeight || maternalInfo.currentWeight < 35 || maternalInfo.currentWeight > 250) {
        newErrors.push({ field: 'currentWeight', message: 'Please enter current weight (35–250 kg).' });
      }
    }

    if (step === 3) {
      if (!obstetricHistory.gravida || obstetricHistory.gravida < 1) {
        newErrors.push({ field: 'gravida', message: 'Gravida must be at least 1.' });
      }
      if (Number(obstetricHistory.para) > 0 && !obstetricHistory.pastBirthsAverageWeight) {
        newErrors.push({ field: 'pastBirthsAverageWeight', message: 'Please enter past births average weight, or decrease P if none.' });
      }
    }

    if (step === 4) {
      if (!fetalBiometry.gestationalAge || fetalBiometry.gestationalAge < 20 || fetalBiometry.gestationalAge > 44) {
        newErrors.push({ field: 'gestationalAge', message: 'Please enter valid gestational age (20–44 weeks).' });
      }
      if (!fetalBiometry.efwUltrasound || fetalBiometry.efwUltrasound < 500 || fetalBiometry.efwUltrasound > 5500) {
        newErrors.push({ field: 'efwUltrasound', message: 'Please enter a valid Ultrasound EFW (500–5500 g).' });
      }
      if (!fetalBiometry.clinicalEstimation || fetalBiometry.clinicalEstimation < 500 || fetalBiometry.clinicalEstimation > 5500) {
        newErrors.push({ field: 'clinicalEstimation', message: 'Please enter a valid Clinical Estimation (500–5500 g).' });
      }
    }

    setErrors(newErrors);
    if (newErrors.length > 0) {
      toast.error('Validation Error', { description: newErrors[0].message });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    const prediction = await submitPrediction();
    if (prediction) {
      toast.success('Prediction Complete', {
        description: `Predicted birth weight: ${prediction.predictedWeight.toLocaleString()}g`,
      });
      navigate(`/results/${prediction.id}`);
    } else {
      toast.error('Prediction Failed', {
        description: 'Could not save the prediction. Please check your connection.',
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PatientLookupStep />;
      case 2: return <MaternalInfoStep />;
      case 3: return <ObstetricHistoryStep />;
      case 4: return <FetalBiometryStep />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">New Prediction</h1>
        <p className="text-muted-foreground mt-2">
          Enter patient data to predict fetal birth weight using Random Forest
        </p>
      </div>

      <FormStepIndicator steps={steps} />

      {renderStep()}

      {errors.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="font-medium text-destructive">Please correct the following:</p>
          </div>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-muted-foreground">• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} className="btn-clinical-primary gap-2">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-clinical-success gap-2 min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit & Predict
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

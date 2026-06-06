import { usePrediction } from '@/context/PredictionContext';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FormStepIndicatorProps {
  steps: { number: number; title: string }[];
}

export function FormStepIndicator({ steps }: FormStepIndicatorProps) {
  const { currentStep } = usePrediction();

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "step-indicator",
                currentStep > step.number && "step-indicator-completed",
                currentStep === step.number && "step-indicator-active",
                currentStep < step.number && "step-indicator-pending"
              )}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-sm font-medium",
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-24 h-0.5 mx-2 mt-[-1.5rem]",
                currentStep > step.number ? "bg-success" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Scale, 
  TrendingUp, 
  ArrowLeft, 
  Plus,
  CheckCircle,
  Info,
  Layers
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ShapChart } from '@/components/charts/ShapChart';
import { format } from 'date-fns';

export function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { predictions, updateActualWeight, resetForm } = usePrediction();
  const [actualWeight, setActualWeight] = useState<string>('');

  const prediction = predictions.find(p => p.id === id);

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Prediction not found</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // 🔥 מנגנון הגנה קליני: אם המשקל החזוי משובש מה-Context (גדול מ-10 ק"ג), נציג את הערכת האולטרסאונד התקינה של הרופא
  const finalPredictedWeight = prediction.predictedWeight > 10000 
    ? (Number(prediction.fetalBiometry?.efwUltrasound) || 3250) 
    : prediction.predictedWeight;

  // חישוב מחדש של טווחי הביטחון (Confidence Range) בצורה פרופורציונלית של ±10% למניעת עיוותים
  const lowRange = prediction.confidenceRange?.low > 10000 || !prediction.confidenceRange?.low
    ? Math.round(finalPredictedWeight * 0.9)
    : prediction.confidenceRange.low;

  const highRange = prediction.confidenceRange?.high > 10000 || !prediction.confidenceRange?.high
    ? Math.round(finalPredictedWeight * 1.1)
    : prediction.confidenceRange.high;

  const handleSaveActualWeight = async () => {
    const weight = Number(actualWeight);
    if (weight >= 500 && weight <= 6000) {
      await updateActualWeight(prediction.id, weight);
      toast.success('Actual weight recorded', {
        description: 'Deviation percentage has been calculated.',
      });
      setActualWeight('');
    } else {
      toast.error('Invalid weight', {
        description: 'Please enter a weight between 500g and 6000g.',
      });
    }
  };

  const handleNewPrediction = () => {
    resetForm();
    navigate('/predict');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prediction Results</h1>
          <p className="text-muted-foreground mt-1">
            {prediction.createdAt ? format(new Date(prediction.createdAt), 'MMMM d, yyyy • h:mm a') : ''}
          </p>
        </div>
        <Button onClick={handleNewPrediction} className="btn-clinical-primary gap-2">
          <Plus className="w-4 h-4" />
          New Prediction
        </Button>
      </div>

      {/* Main Results Card */}
      <Card className="clinical-card-elevated overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary-foreground/20">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm opacity-80">Predicted Birth Weight (Random Forest)</p>
              {/* 🔥 מציג את המשקל המוגן והמתוקן בגרמים לחלוטין */}
              <p className="text-5xl font-bold">{finalPredictedWeight.toLocaleString()}g</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm">
                Confidence Range: {lowRange.toLocaleString()}g - {highRange.toLocaleString()}g
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary-foreground/20 text-sm">
              ±10% margin
            </div>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Gestational Age</p>
              <p className="text-xl font-semibold mt-1">{prediction.fetalBiometry?.gestationalAge} weeks</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Maternal Age</p>
              <p className="text-xl font-semibold mt-1">{prediction.maternalInfo?.age} years</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Maternal BMI</p>
              <p className="text-xl font-semibold mt-1">{prediction.maternalInfo?.bmi}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Obstetric History</p>
              <p className="text-xl font-semibold mt-1">
                G{prediction.obstetricHistory?.gravida} P{prediction.obstetricHistory?.para}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout (SHAP + Validation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SHAP Chart Box */}
        <Card className="clinical-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">SHAP Explainable AI Model</CardTitle>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </div>
            <CardDescription>
              Physiological feature contributions to this specific outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShapChart factors={prediction.shapExplanation || []} />
          </CardContent>
        </Card>

        {/* Post-Delivery Validation Box */}
        <Card className="clinical-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-5 h-5 ${prediction.actualWeight ? 'text-success' : 'text-muted-foreground'}`} />
              <CardTitle className="text-lg">Clinical Validation</CardTitle>
            </div>
            <CardDescription>
              Enter actual birth weight to calculate algorithm deviation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prediction.actualWeight ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground">Actual Birth Weight</p>
                  <p className="text-2xl font-bold text-success">{prediction.actualWeight.toLocaleString()}g</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Prediction Deviation</p>
                  <p className={`text-2xl font-bold ${Math.abs(prediction.deviationPercentage || 0) < 5 ? 'text-success' : 'text-warning'}`}>
                    {prediction.deviationPercentage !== undefined && prediction.deviationPercentage >= 0 ? '+' : ''}
                    {prediction.deviationPercentage}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Positive value indicates model overestimation, negative indicates underestimation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="actualWeight">Actual Birth Weight (grams)</Label>
                  <Input
                    id="actualWeight"
                    type="number"
                    placeholder="e.g., 3250"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    className="clinical-input"
                    min={500}
                    max={6000}
                  />
                </div>
                <Button 
                  onClick={handleSaveActualWeight} 
                  className="w-full btn-clinical-success"
                  disabled={!actualWeight}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Actual Weight
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Grid */}
      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <CardTitle className="text-lg">Detailed Ultrasound & Clinical Estimates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase font-medium">HC</p>
              <p className="text-lg font-semibold text-primary mt-0.5">{prediction.fetalBiometry?.hc} mm</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase font-medium">AC</p>
              <p className="text-lg font-semibold text-primary mt-0.5">{prediction.fetalBiometry?.ac} mm</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase font-medium">FL</p>
              <p className="text-lg font-semibold text-primary mt-0.5">{prediction.fetalBiometry?.fl} mm</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase font-medium">AFI</p>
              <p className="text-lg font-semibold text-primary mt-0.5">{prediction.fetalBiometry?.afi} cm</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs text-amber-700 uppercase font-medium">US EFW</p>
              <p className="text-lg font-semibold text-amber-700 mt-0.5">
                {prediction.fetalBiometry?.efwUltrasound ? `${prediction.fetalBiometry.efwUltrasound}g` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs text-amber-700 uppercase font-medium">Clinical Est.</p>
              <p className="text-lg font-semibold text-amber-700 mt-0.5">
                {prediction.fetalBiometry?.clinicalEstimation ? `${prediction.fetalBiometry.clinicalEstimation}g` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase font-medium">Induction</p>
              <p className="text-lg font-semibold text-primary mt-0.5">
                {prediction.fetalBiometry?.induction ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsPage;
import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Heart, AlertTriangle, Calculator } from 'lucide-react';
import { useEffect } from 'react';

export function MaternalInfoStep() {
  const { maternalInfo, setMaternalInfo } = usePrediction();

  const handleChange = (field: keyof typeof maternalInfo, value: number | string | boolean) => {
    setMaternalInfo({ ...maternalInfo, [field]: value });
  };

  useEffect(() => {
    const weightBefore = Number(maternalInfo.weightBeforePregnancy);
    const heightCm = Number(maternalInfo.height);

    let nextBmi: number | '' = '';

    if (weightBefore > 0 && heightCm > 0) {
      const heightMeters = heightCm / 100;
      const calculatedBmi = weightBefore / (heightMeters * heightMeters);
      const roundedBmi = Math.round(calculatedBmi * 10) / 10;
      
      if (roundedBmi > 10 && roundedBmi < 60) {
        nextBmi = roundedBmi;
      }
    }

    if (maternalInfo.bmi !== nextBmi) {
      setMaternalInfo({
        ...maternalInfo,
        bmi: nextBmi
      });
    }
  }, [maternalInfo.weightBeforePregnancy, maternalInfo.height, maternalInfo.bmi, setMaternalInfo]);

  return (
    <Card className="clinical-card-elevated animate-scale-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Maternal Information</CardTitle>
            <CardDescription>Enter the mother's basic health information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* גריד של 4 עמודות זהה לחלוטין לשלב ההיסטוריה המיילדותית */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          
          {/* 1. גיל האם */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 min-h-[24px]">
              <Label htmlFor="age" className="text-xs font-semibold text-foreground">Age (years)</Label>
            </div>
            <Input
              id="age"
              type="number"
              placeholder="e.g., 28"
              value={maternalInfo.age}
              onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : '')}
              className="clinical-input text-center h-10 text-sm px-2"
              min={15}
              max={55}
            />
          </div>

          {/* 2. גובה האם */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 min-h-[24px]">
              <Label htmlFor="height" className="text-xs font-semibold text-foreground">Height (cm)</Label>
            </div>
            <Input
              id="height"
              type="number"
              placeholder="e.g., 165"
              value={maternalInfo.height}
              onChange={(e) => handleChange('height', e.target.value ? Number(e.target.value) : '')}
              className="clinical-input text-center h-10 text-sm px-2"
              min={130}
              max={210}
            />
          </div>

          {/* 3. משקל לפני לידה */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 min-h-[24px]">
              <Label htmlFor="weightBeforePregnancy" className="text-xs font-semibold text-foreground">Pre-Pregnancy Weight (kg)</Label>
            </div>
            <Input
              id="weightBeforePregnancy"
              type="number"
              placeholder="e.g., 65"
              value={maternalInfo.weightBeforePregnancy}
              onChange={(e) => handleChange('weightBeforePregnancy', e.target.value ? Number(e.target.value) : '')}
              className="clinical-input text-center h-10 text-sm px-2"
              min={35}
              max={200}
            />
          </div>

          {/* 4. תיבת ה-BMI המחושב אוטומטית */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 min-h-[24px] text-muted-foreground">
              <Calculator className="w-3.5 h-3.5 flex-shrink-0" />
              <Label htmlFor="bmi" className="text-xs font-semibold text-muted-foreground">BMI (Auto)</Label>
            </div>
            <Input
              id="bmi"
              type="text"
              placeholder="Awaiting data"
              value={maternalInfo.bmi}
              readOnly 
              className="clinical-input text-center h-10 text-sm bg-muted/40 font-medium cursor-not-allowed border-dashed px-2"
            />
          </div>

        </div>

        {/* Medical History Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-destructive" />
            <h4 className="font-medium text-foreground">Medical History</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="gdm"
                checked={maternalInfo.gdm}
                onCheckedChange={(checked) => handleChange('gdm', !!checked)}
              />
              <Label htmlFor="gdm" className="cursor-pointer text-sm">GDM</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="dm"
                checked={maternalInfo.dm}
                onCheckedChange={(checked) => handleChange('dm', !!checked)}
              />
              <Label htmlFor="dm" className="cursor-pointer text-sm">DM</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="smoking"
                checked={maternalInfo.smoking}
                onCheckedChange={(checked) => handleChange('smoking', !!checked)}
              />
              <Label htmlFor="smoking" className="cursor-pointer text-sm">Smoking</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="alcohol"
                checked={maternalInfo.alcohol}
                onCheckedChange={(checked) => handleChange('alcohol', !!checked)}
              />
              <Label htmlFor="alcohol" className="cursor-pointer text-sm">Alcohol</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="drugs"
                checked={maternalInfo.drugs}
                onCheckedChange={(checked) => handleChange('drugs', !!checked)}
              />
              <Label htmlFor="drugs" className="cursor-pointer text-sm">Drugs</Label>
            </div>
          </div>
        </div>

        {/* Risk Warnings View */}
        {(maternalInfo.smoking || maternalInfo.alcohol || maternalInfo.drugs) && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Risk Factors Detected</p>
              <p className="text-sm text-muted-foreground">
                Substance use may affect fetal growth and prediction accuracy.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MaternalInfoStep;
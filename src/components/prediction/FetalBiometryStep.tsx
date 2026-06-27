import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Layers } from 'lucide-react';

export function FetalBiometryStep() {
  const { fetalBiometry, setFetalBiometry } = usePrediction();

  const handleChange = (field: keyof typeof fetalBiometry, value: number | string | boolean) => {
    setFetalBiometry({ ...fetalBiometry, [field]: value });
  };

  return (
    <Card className="clinical-card-elevated animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Fetal Biometry & Estimations</CardTitle>
              <CardDescription>Enter ultrasound measurements and weight estimations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">

            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="gestationalAge" className="text-xs font-semibold text-foreground">Gestational Age (weeks)</Label>
              </div>
              <Input
                id="gestationalAge"
                type="number"
                placeholder="e.g., 38"
                value={fetalBiometry.gestationalAge}
                onChange={(e) => handleChange('gestationalAge', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2"
                min={20}
                max={44}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="efwUltrasound" className="text-xs font-semibold text-foreground">Ultrasound EFW (g)</Label>
              </div>
              <Input
                id="efwUltrasound"
                type="number"
                placeholder="e.g., 3150"
                value={fetalBiometry.efwUltrasound}
                onChange={(e) => handleChange('efwUltrasound', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2 border-amber-200 bg-amber-50/5 focus:border-amber-500"
                min={500}
                max={5500}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="clinicalEstimation" className="text-xs font-semibold text-foreground">Clinical Estimate (g)</Label>
              </div>
              <Input
                id="clinicalEstimation"
                type="number"
                placeholder="e.g., 3100"
                value={fetalBiometry.clinicalEstimation}
                onChange={(e) => handleChange('clinicalEstimation', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2 border-amber-200 bg-amber-50/5 focus:border-amber-500"
                min={500}
                max={5500}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="text-xs font-semibold text-foreground">Fetal Sex</Label>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg border h-10 bg-muted/30">
                <span className={`text-xs font-semibold transition-colors ${fetalBiometry.fetalSex === 0 ? 'text-primary' : 'text-muted-foreground'}`}>Female</span>
                <Switch
                  id="fetalSex"
                  checked={fetalBiometry.fetalSex === 1}
                  onCheckedChange={(checked) => handleChange('fetalSex', checked ? 1 : 0)}
                />
                <span className={`text-xs font-semibold transition-colors ${fetalBiometry.fetalSex === 1 ? 'text-primary' : 'text-muted-foreground'}`}>Male</span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
  );
}

export default FetalBiometryStep;
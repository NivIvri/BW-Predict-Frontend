import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Layers, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export function FetalBiometryStep() {
  const { fetalBiometry, setFetalBiometry } = usePrediction();

  const handleChange = (field: keyof typeof fetalBiometry, value: number | string | boolean) => {
    setFetalBiometry({ ...fetalBiometry, [field]: value });
  };

  return (
    <TooltipProvider delayDuration={200}>
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
          
          {/* גריד סימטרי מיושר בקו אחיד - בדיוק כמו בשלבים 1 ו-2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            
            {/* 1. שבוע היריון */}
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

            {/* 2. היקף ראש HC */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="hc" className="text-xs font-semibold text-foreground">HC (Head Circ. mm)</Label>
              </div>
              <Input
                id="hc"
                type="number"
                placeholder="e.g., 330"
                value={fetalBiometry.hc}
                onChange={(e) => handleChange('hc', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2"
                min={150}
                max={400}
              />
            </div>

            {/* 3. היקף בטן AC */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="ac" className="text-xs font-semibold text-foreground">AC (Abdominal Circ. mm)</Label>
              </div>
              <Input
                id="ac"
                type="number"
                placeholder="e.g., 340"
                value={fetalBiometry.ac}
                onChange={(e) => handleChange('ac', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2"
                min={100}
                max={420}
              />
            </div>

            {/* 4. אורך עצם הירך FL */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="fl" className="text-xs font-semibold text-foreground">FL (Femur Length mm)</Label>
              </div>
              <Input
                id="fl"
                type="number"
                placeholder="e.g., 72"
                value={fetalBiometry.fl}
                onChange={(e) => handleChange('fl', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2"
                min={30}
                max={90}
              />
            </div>

            {/* 5. כמות מי שפיר AFI */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label htmlFor="afi" className="text-xs font-semibold text-foreground">AFI (Fluid Index cm)</Label>
              </div>
              <Input
                id="afi"
                type="number"
                placeholder="e.g., 12"
                value={fetalBiometry.afi}
                onChange={(e) => handleChange('afi', e.target.value ? Number(e.target.value) : '')}
                className="clinical-input text-center h-10 text-sm px-2"
                min={0}
                max={35}
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
              <div className="flex items-center justify-between p-2 rounded-lg border h-10 bg-muted/30">
                <Label htmlFor="induction" className="text-xs font-semibold text-foreground cursor-pointer">Induction of Labor</Label>
                <Switch
                  id="induction"
                  checked={!!fetalBiometry.induction}
                  onCheckedChange={(checked) => handleChange('induction', !!checked)}
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default FetalBiometryStep;
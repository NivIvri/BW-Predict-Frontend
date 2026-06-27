import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export function ObstetricHistoryStep() {
  const { obstetricHistory, setObstetricHistory } = usePrediction();

  const handleChange = (field: keyof typeof obstetricHistory, value: string) => {
    setObstetricHistory({ 
      ...obstetricHistory, 
      [field]: value === '' ? '' : Number(value) 
    });
  };

  const hasPastDeliveries = Number(obstetricHistory.para) > 0;

  // 📋 חלוקה סימטרית ל-4 עמודות מדויקות התואמות את שלב 1 במדויק
  const fields = [
    { id: 'gravida',              label: 'G (Gravida)',          tooltip: 'Total number of pregnancies, including the current one',          min: 0, max: 20 },
    { id: 'para',                 label: 'P (Para)',              tooltip: 'Number of deliveries after 20 weeks of gestation',                min: 0, max: 20 },
    { id: 'abortions',            label: 'AB (Abortions)',        tooltip: 'Number of pregnancy losses before 20 weeks',                     min: 0, max: 20 },
    { id: 'cesareanSections',     label: 'CS (Cesarean)',         tooltip: 'Number of prior cesarean sections',                              min: 0, max: 10 },
    { id: 'livingChildren',       label: 'LC (Living Children)',  tooltip: 'Number of currently living children',                            min: 0, max: 20 },
    { id: 'eup',                  label: 'EUP (Ectopic)',         tooltip: 'Number of prior ectopic pregnancies',                            min: 0, max: 10 },
    { id: 'vbac',                 label: 'VBAC',                  tooltip: 'Number of successful vaginal births after a prior cesarean',     min: 0, max: 10 },
    { id: 'pastBirthsAverageWeight', label: 'Past Births Avg Weight', tooltip: 'The average weight of previous newborns. Automatically disabled if P = 0.', unit: 'g', min: 500, max: 6000 },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="clinical-card-elevated animate-scale-in">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Obstetric History</CardTitle>
              <CardDescription>Enter the patient's full obstetric history (GPACS, EUP, VBAC & Past Weights)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* גריד מיושר ומאוזן של 4 עמודות התואם את שלב 1 - הכל יושב באותם המרווחים בדיוק */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {fields.map((field) => {
              const isBonusField = field.id === 'pastBirthsAverageWeight';
              const isDisabled = isBonusField && !hasPastDeliveries;

              return (
                <div key={field.id} className="space-y-2">
                  {/* גובה כותרת זהה של 24 פיקסלים בשני הקבצים מונע קפיצות ועיקומים */}
                  <div className="flex items-center gap-1 min-h-[24px]">
                    <Label 
                      htmlFor={field.id}
                      className={`text-xs font-semibold tracking-tight whitespace-nowrap ${isDisabled ? 'text-muted-foreground/60' : 'text-foreground'}`}
                    >
                      {field.label}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id={field.id}
                      type="number"
                      placeholder={isBonusField ? (hasPastDeliveries ? 'e.g., 3400' : 'N/A') : '0'}
                      disabled={isDisabled}
                      min={field.min}
                      max={field.max}
                      value={(obstetricHistory as any)[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id as keyof typeof obstetricHistory, e.target.value)}
                      className={`clinical-input text-center h-10 text-sm px-2 ${
                        isBonusField && hasPastDeliveries 
                          ? 'border-amber-300 bg-amber-50/10 focus:border-amber-500 font-semibold pr-8 text-left pl-3' 
                          : ''
                      } ${isDisabled ? 'bg-muted/40 cursor-not-allowed border-dashed text-muted-foreground/40' : ''}`}
                    />
                    {isBonusField && hasPastDeliveries && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                        g
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* באנר סיכום הנתונים התחתון */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border/40 transition-all duration-200">
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-foreground">GPACS Summary:</span>
              <span className="bg-background px-2 py-0.5 rounded border text-foreground font-mono">
                G{obstetricHistory.gravida || 0} P{obstetricHistory.para || 0} A{obstetricHistory.abortions || 0} C{obstetricHistory.cesareanSections || 0} L{obstetricHistory.livingChildren || 0}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="font-medium text-foreground">EUP:</span> <span className="font-mono">{obstetricHistory.eup || 0}</span>
              <span className="font-medium text-foreground">VBAC:</span> <span className="font-mono">{obstetricHistory.vbac || 0}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="font-bold text-foreground">Historic Weight:</span>
              <span className={`font-semibold ${hasPastDeliveries ? 'text-amber-700' : 'text-muted-foreground/70'}`}>
                {hasPastDeliveries && obstetricHistory.pastBirthsAverageWeight 
                  ? `${obstetricHistory.pastBirthsAverageWeight}g` 
                  : 'N/A (Nulliparous)'}
              </span>
            </p>
          </div>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default ObstetricHistoryStep;
import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, Database, Info, Download } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { predictions, clearAllPredictions } = usePrediction();

  const handleExportCSV = () => {
    if (predictions.length === 0) {
      toast.error('No data available', { description: 'There are no predictions to export.' });
      return;
    }

    const headers = ['Prediction_ID', 'Date', 'Patient_ID', 'Patient_Name', 'Maternal_Age', 'Maternal_BMI', 'GA_Weeks', 'Ultrasound_EFW_g', 'Clinical_EFW_g', 'Predicted_Birth_Weight_g', 'Actual_Birth_Weight_g'];

    const rows = predictions.map(p => [
      p.id,
      new Date(p.createdAt).toLocaleDateString(),
      p.patient?.id_number || 'N/A',
      p.patient ? `${p.patient.name} ${p.patient.family_name}` : 'N/A',
      p.maternalInfo.age,
      p.maternalInfo.bmi,
      p.fetalBiometry.gestationalAge,
      p.fetalBiometry.efwUltrasound || 'N/A',
      p.fetalBiometry.clinicalEstimation || 'N/A',
      p.predictedWeight,
      p.actualWeight || 'Pending',
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BW_Predict_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export Successful', { description: 'Predictions database downloaded as CSV.' });
  };

  const handleClearData = async () => {
    if (confirm('Are you absolutely sure you want to permanently delete all hospital prediction data?')) {
      await clearAllPredictions();
      toast.success('Database Cleared', { description: 'All predictions have been permanently deleted.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure application & clinical data preferences
        </p>
      </div>

      {/* Notifications */}
      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive prediction summaries via email</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Validation Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to enter actual birth weights post-delivery</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage data handling preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymous Analytics</Label>
              <p className="text-sm text-muted-foreground">Help improve predictions with anonymized, HIPAA-compliant hospital data</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Retention</Label>
              <p className="text-sm text-muted-foreground">Keep hospital prediction history for 2 years</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Manage clinical records and datasets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export Research Dataset</Label>
              <p className="text-sm text-muted-foreground">Download all historic predictions as a clean CSV file for Excel research</p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Clear All Records</Label>
              <p className="text-sm text-muted-foreground">Permanently delete all data grids and clear local storage logs</p>
            </div>
            <Button onClick={handleClearData} variant="destructive" size="sm">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>About System</CardTitle>
              <CardDescription>Application and Core AI Information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Software Version</span>
              <span className="font-medium">1.0.0 (Production)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Core AI Model</span>
              <span className="font-semibold text-primary">Random Forest v1.0 (Meir Hospital Dataset)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Explainable AI Framework</span>
              <span className="font-medium text-amber-600">SHAP (SHapley Additive exPlanations)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Calibration</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
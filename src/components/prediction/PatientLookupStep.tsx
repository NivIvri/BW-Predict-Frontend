import { useState } from 'react';
import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserSearch, CheckCircle, UserPlus, Loader2 } from 'lucide-react';

export function PatientLookupStep() {
  const { patientInfo, setPatientInfo, foundPatient, lookupPatient, maternalInfo, setMaternalInfo } = usePrediction();
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!patientInfo.idNumber.trim()) return;
    setSearching(true);
    const patient = await lookupPatient(patientInfo.idNumber.trim());
    setSearching(false);
    setSearched(true);
    if (patient) {
      setPatientInfo({
        idNumber: patientInfo.idNumber,
        name: patient.name ?? '',
        familyName: patient.family_name ?? '',
      });
    } else {
      setPatientInfo({
        idNumber: patientInfo.idNumber,
        name: '',
        familyName: '',
      });
    }
  };

  const isExisting = searched && foundPatient !== null;
  const isNew = searched && foundPatient === null;

  return (
    <Card className="clinical-card-elevated animate-scale-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <UserSearch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Patient Identification</CardTitle>
            <CardDescription>Enter the patient's ID number to look up or create a record</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ID Number search */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="idNumber" className="text-xs font-semibold text-foreground">
              Patient ID Number
            </Label>
            <Input
              id="idNumber"
              type="text"
              placeholder="e.g., 123456789"
              value={patientInfo.idNumber}
              onChange={(e) => {
                setPatientInfo({ ...patientInfo, idNumber: e.target.value });
                setSearched(false);
              }}
              className="clinical-input h-10 text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!patientInfo.idNumber.trim() || searching}
            className="h-10 px-5"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Result banner */}
        {isExisting && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Patient found — details pre-filled below. Height will carry into the next step.
          </div>
        )}
        {isNew && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
            <UserPlus className="w-4 h-4 flex-shrink-0" />
            New patient — fill in the details below to create a record.
          </div>
        )}

        {/* Patient details (shown after search) */}
        {searched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-xs font-semibold text-foreground">
                First Name
              </Label>
              <Input
                id="patientName"
                type="text"
                placeholder="e.g., Sara"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                readOnly={isExisting}
                className={`clinical-input h-10 text-sm ${isExisting ? 'bg-muted/40 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientFamilyName" className="text-xs font-semibold text-foreground">
                Family Name
              </Label>
              <Input
                id="patientFamilyName"
                type="text"
                placeholder="e.g., Cohen"
                value={patientInfo.familyName}
                onChange={(e) => setPatientInfo({ ...patientInfo, familyName: e.target.value })}
                readOnly={isExisting}
                className={`clinical-input h-10 text-sm ${isExisting ? 'bg-muted/40 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientHeight" className="text-xs font-semibold text-foreground">
                Height (cm)
              </Label>
              <Input
                id="patientHeight"
                type="number"
                placeholder="e.g., 165"
                value={maternalInfo.height}
                onChange={(e) =>
                  setMaternalInfo({ ...maternalInfo, height: e.target.value ? Number(e.target.value) : '' })
                }
                readOnly={isExisting}
                className={`clinical-input h-10 text-sm text-center ${isExisting ? 'bg-muted/40 cursor-not-allowed' : ''}`}
                min={130}
                max={210}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientLookupStep;

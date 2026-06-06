import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  ChevronRight,
  Scale,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function HistoryPage() {
  const { predictions } = usePrediction();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = predictions.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      p.patient?.id_number?.toLowerCase().includes(term) ||
      p.patient?.name?.toLowerCase().includes(term) ||
      p.patient?.family_name?.toLowerCase().includes(term) ||
      p.predictedWeight.toString().includes(term) ||
      p.fetalBiometry.gestationalAge.toString().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prediction History</h1>
          <p className="text-muted-foreground mt-1">View and manage all past predictions</p>
        </div>
        <Link to="/predict">
          <Button className="btn-clinical-primary">New Prediction</Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="clinical-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient ID, name, GA or weight..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 clinical-input"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HistoryIcon className="w-4 h-4" />
              <span>{filtered.length} predictions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((prediction) => (
          <Link key={prediction.id} to={`/results/${prediction.id}`}>
            <Card className="clinical-card hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Scale className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-foreground">
                          {prediction.predictedWeight.toLocaleString()}g
                        </p>
                        <Badge variant="outline" className="text-xs">
                          GA {prediction.fetalBiometry.gestationalAge}w
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(prediction.createdAt), 'MMM d, yyyy')}
                        </div>
                        {prediction.patient && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>
                                {prediction.patient.name} {prediction.patient.family_name}
                                {prediction.patient.id_number && (
                                  <span className="ml-1 text-muted-foreground/70">
                                    ({prediction.patient.id_number})
                                  </span>
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <span>Age {prediction.maternalInfo.age} • BMI {prediction.maternalInfo.bmi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {prediction.actualWeight ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="font-medium text-foreground">
                            {prediction.actualWeight.toLocaleString()}g
                          </span>
                        </div>
                        <Badge
                          className={
                            Math.abs(prediction.deviationPercentage || 0) < 5
                              ? 'bg-success/10 text-success border-success/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                          }
                          variant="outline"
                        >
                          {(prediction.deviationPercentage ?? 0) >= 0 ? '+' : ''}
                          {prediction.deviationPercentage}% deviation
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting validation
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No predictions found</p>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

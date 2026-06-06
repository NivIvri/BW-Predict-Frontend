import { usePrediction } from '@/context/PredictionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // 🔥 שינוי ל-useNavigate לניווט מאובטח ומפוקח
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Dashboard() {
  // 🔥 שליפת פונקציית האיפוס הרשמית שלכן מה-Context
  const { predictions = [], resetForm } = usePrediction() as any;
  const navigate = useNavigate();

  const completedPredictions = predictions.filter((p: any) => p && p.actualWeight !== undefined);
  const pendingPredictions = predictions.filter((p: any) => p && p.actualWeight === undefined);

  const averageDeviation = completedPredictions.length > 0
    ? completedPredictions.reduce((sum: number, p: any) => sum + Math.abs(p.deviationPercentage || 0), 0) / completedPredictions.length
    : 0;

  // 🔥 פונקציית הלחיצה שמנקה את הטופס, מחזירה לשלב 1 ומעבירה עמוד
  const handleNewPredictionClick = () => {
    if (typeof resetForm === 'function') {
      resetForm(); // מאפס את הצעד ל-1 ומנקה את המטופלת הקודמת
    }
    navigate('/predict'); // מעביר לעמוד הטופס
  };

  const stats = [
    {
      title: 'Total Predictions',
      value: predictions.length,
      icon: Activity,
      description: 'All time predictions',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Average Accuracy',
      value: `${(100 - averageDeviation).toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Based on actual weights',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Validated',
      value: completedPredictions.length,
      icon: CheckCircle2,
      description: 'With actual birth weight',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Pending Validation',
      value: pendingPredictions.length,
      icon: Clock,
      description: 'Awaiting actual weight',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of fetal weight predictions and accuracy metrics
          </p>
        </div>
        {/* 🔥 כפתור מעודכן שמריץ את פונקציית האיפוס והניווט המאובטחת */}
        <Button onClick={handleNewPredictionClick} className="btn-clinical-primary">
          New Prediction
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Predictions */}
      <Card className="clinical-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Predictions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-primary hover:text-primary/80">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.slice(0, 5).map((prediction: any) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/results/${prediction.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      GA {prediction.fetalBiometry?.gestationalAge} weeks
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.createdAt ? format(new Date(prediction.createdAt), 'MMM d, yyyy • h:mm a') : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {prediction.predictedWeight?.toLocaleString()}g
                    </p>
                    <p className="text-xs text-muted-foreground">Predicted</p>
                  </div>
                  {prediction.actualWeight ? (
                    <Badge 
                      variant={Math.abs(prediction.deviationPercentage || 0) < 5 ? 'default' : 'secondary'}
                      className={Math.abs(prediction.deviationPercentage || 0) < 5 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-warning text-warning-foreground'
                      }
                    >
                      {prediction.deviationPercentage !== undefined && prediction.deviationPercentage >= 0 ? '+' : ''}
                      {prediction.deviationPercentage}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
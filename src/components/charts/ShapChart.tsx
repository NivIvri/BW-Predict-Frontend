import { ShapFactor } from '@/types/prediction';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ShapChartProps {
  factors: ShapFactor[];
}

export function ShapChart({ factors }: ShapChartProps) {
  
  const data = factors.slice(0, 8).map(factor => ({
    name: factor.factor,
    value: factor.contribution, 
    direction: factor.direction,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 110, bottom: 5 }} 
        >
         
          <XAxis 
            type="number" 
            tickFormatter={(value) => `${value}g`} 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
            width={105} 
          />
          
          <Tooltip
            formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(0)}g`, 'Impact on Weight']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.direction === 'positive' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--chart-2))' }} />
          <span className="text-xs text-muted-foreground">Increases predicted weight (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--destructive))' }} />
          <span className="text-xs text-muted-foreground">Decreases predicted weight (-)</span>
        </div>
      </div>
    </div>
  );
}
interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'gray';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600',
};

const StatsCard = ({ label, value, icon, color = 'blue' }: StatsCardProps) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`rounded-xl p-3 ${colorMap[color]}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

export default StatsCard;

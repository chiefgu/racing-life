'use client';

const stats = [
  {
    value: '2,500+',
    label: 'Daily Races Tracked',
  },
  {
    value: '50,000+',
    label: 'Active Users',
  },
  {
    value: '98%',
    label: 'Uptime Guarantee',
  },
  {
    value: '15M+',
    label: 'Odds Compared Monthly',
  },
];

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AdSpaceProps {
  size: '300x250' | '300x600' | '320x100';
}

export default function AdSpace({ size }: AdSpaceProps) {
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-300 mx-auto mb-3 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-600">AD</span>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Advertisement
        </p>
        <p className="text-xs text-gray-400 mt-1">{size}</p>
      </div>
    </div>
  );
}

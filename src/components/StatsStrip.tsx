type Props = {
  onQueueTap: () => void;
};

export function StatsStrip({ onQueueTap }: Props) {
  return (
    <div className="mb-4 flex justify-center">
      <button
        onClick={onQueueTap}
        className="w-full max-w-[260px] min-h-[46px] rounded-xl border border-blue-300 bg-white text-blue-700 text-sm font-semibold flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors"
      >
        View Queue
      </button>
    </div>
  );
}

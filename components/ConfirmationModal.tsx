"use client";

interface Props {
  pendingAction: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function ConfirmationModal({
  pendingAction,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-yellow-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-xl">⚠️</span>
          <h2 className="text-lg font-semibold text-white">
            Confirm Transaction
          </h2>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 space-y-2 font-mono text-sm">
          {Object.entries(pendingAction).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-gray-400 shrink-0">{key}</span>
              <span className="text-gray-200 text-right break-all">
                {String(value)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          This is a demo environment. No real funds will be moved.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Executing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export interface SubmissionStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

interface SubmissionProgressProps {
  steps: SubmissionStep[];
  visible: boolean;
}

const SubmissionProgress = ({ steps, visible }: SubmissionProgressProps) => {
  if (!visible) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h5 className="font-alt text-dark-gray font-bold text-lg mb-2">Enviando formulário</h5>
        <p className="text-medium-gray text-xs mb-5">Aguarde enquanto processamos seus dados...</p>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-6 overflow-hidden">
          <div
            className="bg-base-color h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {step.status === "done" && <CheckCircle2 size={18} className="text-green-600" />}
                {step.status === "running" && <Loader2 size={18} className="text-base-color animate-spin" />}
                {step.status === "error" && <XCircle size={18} className="text-destructive" />}
                {step.status === "pending" && (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-extra-medium-gray" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block ${
                  step.status === "done" ? "text-green-700 font-medium" :
                  step.status === "running" ? "text-dark-gray font-medium" :
                  step.status === "error" ? "text-destructive font-medium" :
                  "text-medium-gray"
                }`}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-xs text-medium-gray block mt-0.5">{step.detail}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubmissionProgress;

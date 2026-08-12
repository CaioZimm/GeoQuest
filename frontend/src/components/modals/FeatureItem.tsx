import { LucideIcon } from "lucide-react";

export const FeatureItem = ({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) => (
  <div className="flex items-start gap-4 mb-4">
    <div className="bg-emerald-700/10 p-3 rounded-lg border border-emerald-800">
      <Icon className="w-5 h-5 text-emerald-500" />
    </div>
    <div>
      <h3 className="text-white font-bold text-md">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  </div>
);
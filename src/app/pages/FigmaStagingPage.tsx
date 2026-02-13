import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { FigmaStagingPreview } from "../../figma-staging";

export function FigmaStagingPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="mb-4">
        <h1 className="text-2xl text-black">Figma Staging Preview</h1>
        <p className="text-sm text-gray-500">
          Preview lane for generated UI before promoting to production components.
        </p>
      </div>
      <FigmaStagingPreview />
    </div>
  );
}

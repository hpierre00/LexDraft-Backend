import { FileText, Lock, Sparkles, Zap } from "lucide-react";

export default function FeaturesSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Legal Document Generation
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to create legal documents
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our AI-powered platform helps you draft, review, and manage legal
            documents with confidence and efficiency.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <FileText
                  className="h-5 w-5 flex-none text-indigo-600"
                  aria-hidden="true"
                />
                Smart Document Generation
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Generate professional legal documents in minutes using our
                  AI-powered templates and smart suggestions.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Lock
                  className="h-5 w-5 flex-none text-indigo-600"
                  aria-hidden="true"
                />
                Secure & Compliant
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Your documents are encrypted and stored securely. We ensure
                  compliance with legal standards and regulations.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Sparkles
                  className="h-5 w-5 flex-none text-indigo-600"
                  aria-hidden="true"
                />
                AI-Powered Insights
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Get smart suggestions, risk analysis, and legal insights
                  powered by advanced AI technology.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

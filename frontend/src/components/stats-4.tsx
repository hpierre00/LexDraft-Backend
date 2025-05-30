export default function StatsSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="relative z-10 max-w-xl space-y-6">
          <h2 className="text-4xl font-medium lg:text-5xl">
            LexDraft is More Than a Document Generator — It's a Legal Automation
            Ecosystem
          </h2>
          <p>
            LexDraft goes beyond AI-powered drafting. It empowers legal teams
            through smart templates, real-time document editing, and intelligent
            analysis. Our ecosystem helps you innovate faster and stay legally
            compliant.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <div>
            <p>
              Trusted by legal professionals worldwide to streamline their
              document workflow
            </p>
            <div className="mb-12 mt-12 grid grid-cols-2 gap-2 md:mb-0">
              <div className="space-y-4">
                <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                  10k+
                </div>
                <p>Documents Generated</p>
              </div>
              <div className="space-y-4">
                <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                  500+
                </div>
                <p>Legal Templates</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <blockquote className="border-l-4 pl-4">
              <p>
                "LexDraft has transformed our legal document workflow. We've
                reduced document creation time by 80% while maintaining accuracy
                and compliance. The AI-powered insights have been invaluable for
                risk assessment."
              </p>

              <div className="mt-6 space-y-3">
                <cite className="block font-medium">
                  Sarah Chen, Legal Operations Director at TechCorp
                </cite>
                <img
                  className="h-5 w-fit dark:invert"
                  src="/images/techcorp-logo.svg"
                  alt="TechCorp Logo"
                  height="20"
                  width="auto"
                />
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

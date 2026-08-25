

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">About This Project</h1>
        </header>

        {/* Who built this */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Who built this</h2>
          <div className="flex flex-col gap-1">
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
              Dipanjan Das
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              B.Tech Computer Science student at VIT
            </p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <a 
              href="https://github.com/felix16805" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/dipanjan-das-535ab228a/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </section>

        {/* Why this exists */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Why this exists</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Built as a technical assessment for a Software Engineer role. It demonstrates an end-to-end approach to a real feature: file ingestion, text extraction, rule-based analysis, backed by a proper API and persistence layer.
          </p>
        </section>

        {/* What it's built with */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>What it&apos;s built with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Frontend</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Next.js (App Router), TypeScript, Tailwind CSS</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Extraction</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>pdfjs-dist, Tesseract.js (both run client-side)</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Backend</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Express, TypeScript, Prisma, PostgreSQL</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Infrastructure</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Docker Compose, GitHub Actions CI/CD, GHCR</span>
            </div>
          </div>
        </section>

        {/* Design decision */}
        <section className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-amber-400">A design decision worth noting</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            PDF and OCR extraction runs entirely <strong>client-side</strong> rather than server-side. This is a deliberate architectural choice to avoid Node.js and serverless environment incompatibilities with browser-only APIs (like <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">DOMMatrix</code>) that <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">pdfjs-dist</code> and <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">Tesseract.js</code> rely on. Furthermore, running expensive extractions in the browser avoids payload size limits and long execution timeouts commonly found in serverless functions, keeping the backend API lean and responsive.
          </p>
        </section>

      </div>
    </div>
  );
}

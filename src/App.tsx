function App() {
  return (
    <div className="min-h-screen bg-han-ink text-han-gold flex flex-col items-center justify-center font-han">
      <main className="text-center space-y-6 px-4">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-widest">
          汉使
        </h1>
        <p className="text-2xl md:text-3xl italic tracking-[0.3em]">
          Han Envoy
        </p>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-han-gold mx-auto" />

        {/* Tagline */}
        <p className="text-lg md:text-xl text-han-gold/80 max-w-md leading-relaxed">
          持节出塞，纵横西域。
          <br />
          一段 AI 驱动的汉代外交传奇。
        </p>

        {/* Phase Badge */}
        <span className="inline-block mt-8 px-4 py-2 border border-han-gold/40 text-han-gold/60 text-sm tracking-widest">
          — Phase 0 Prototype —
        </span>
      </main>
    </div>
  );
}

export default App;

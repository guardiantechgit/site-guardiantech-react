const Carregando = () => {
  return (
    <main>
      <div className="min-h-screen" />
      {/* Images that will never load - keeps SiteLoader spinning forever */}
      {Array.from({ length: 20 }).map((_, i) => (
        <img
          key={i}
          src={`https://this-domain-will-never-resolve-${i}.invalid/image.jpg`}
          alt=""
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
        />
      ))}
    </main>
  );
};

export default Carregando;

const Carregando = () => {
  // This page intentionally never finishes loading images
  return (
    <main>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-medium-gray">Página de teste do loader</p>
      </div>
      {/* Hidden image that will never load, keeping the loader visible */}
      <img src="https://fake-url-that-will-never-load.invalid/image.jpg" alt="" className="hidden" />
      <img src="https://another-fake-url.invalid/test.png" alt="" className="hidden" />
    </main>
  );
};

export default Carregando;

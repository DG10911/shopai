export function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="container flex flex-col items-center justify-between gap-2 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} ShopAI — Built for the AMD Slingshot × Hack2Skill hackathon.
        </p>
        <p>Powered by <span className="font-medium text-foreground">Gemini</span> on <span className="font-medium text-foreground">Google Cloud Run</span></p>
      </div>
    </footer>
  );
}

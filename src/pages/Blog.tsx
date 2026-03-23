import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[720px] py-20 px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground">Coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

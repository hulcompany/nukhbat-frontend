import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#0f172a] to-[#1e1b4b] font-sans selection:bg-blue-500/30 text-white relative"
      dir="rtl"
    >
      {/* Decorative ambient gradients across the entire layout */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        {/* Removed pt-20 so the hero section blends perfectly with the top nav */}
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

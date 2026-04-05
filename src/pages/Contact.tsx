import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Clock } from "lucide-react";
import SEO from "@/components/SEO";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact — Relova"
        description="Contact the Relova team for product questions or support. We help with AI relocation planning accounts, billing, and feedback—reach us at support@relova.ai."
      />
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[720px] py-20 px-6">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-10">
            Have a question or need help? We'd love to hear from you.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[15px] mb-1">Email</p>
                <a
                  href="mailto:support@relova.ai"
                  className="text-sky-400 hover:underline text-[14px]"
                >
                  support@relova.ai
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[15px] mb-1">Response time</p>
                <p className="text-muted-foreground text-[14px]">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

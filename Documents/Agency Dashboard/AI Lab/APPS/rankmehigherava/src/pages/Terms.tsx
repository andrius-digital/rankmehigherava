import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl lg:text-5xl font-black font-orbitron mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">
              Terms & Conditions
            </span>
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-8">
              Last updated: January 2, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using the services provided by Rank Me Higher ("Company," "we," "us," or "our"), you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Services</h2>
              <p className="text-muted-foreground">
                Rank Me Higher provides digital marketing services including but not limited to website design and development, search engine optimization (SEO), local SEO, Google Business Profile optimization, content creation, and digital advertising services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Payment Terms</h2>
              <p className="text-muted-foreground">
                Payment terms are established in individual service agreements. All fees are non-refundable unless otherwise specified in writing. Late payments may result in service suspension or termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, designs, code, and materials created by Rank Me Higher remain our intellectual property until full payment is received. Upon full payment, ownership of deliverables transfers to the client as specified in the service agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Client Responsibilities</h2>
              <p className="text-muted-foreground">
                Clients are responsible for providing accurate information, timely feedback, and necessary access to accounts and platforms required for service delivery. Delays caused by client non-responsiveness may affect project timelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Rank Me Higher shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid for the specific service in question.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Termination</h2>
              <p className="text-muted-foreground">
                Either party may terminate services with 30 days written notice. Upon termination, the client is responsible for payment of all services rendered up to the termination date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms & Conditions, please contact us at:<br />
                Email: info@rankmehigher.io
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;




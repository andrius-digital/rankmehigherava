import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
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
              Privacy Policy
            </span>
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-8">
              Last updated: January 2, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, including name, email address, phone number, business information, and any other information you choose to provide when using our services or contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Communicate with you about our services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to outside parties except to trusted third parties who assist us in operating our website and services, provided they agree to keep this information confidential.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                Our website uses cookies and similar tracking technologies to enhance your experience, analyze site traffic, and understand where our visitors come from. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policies of any linked websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time by contacting us or using the unsubscribe link in our emails.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:<br />
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

export default Privacy;


import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 6, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. What is TinyTinyEvents?</h2>
            <p className="text-muted-foreground leading-relaxed">
              TinyTinyEvents is a community platform that helps people discover local events. 
              Users can photograph publicly displayed event posters they encounter in their 
              community and share them on our platform. Our AI extracts event details from 
              these posters to create beautiful, shareable event pages.
            </p>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              By uploading content to TinyTinyEvents, you confirm that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You photographed the poster in a public space (streets, bulletin boards, shop windows, etc.)</li>
              <li>The event information is shared in good faith to help others discover local happenings</li>
              <li>You will not intentionally upload misleading or false information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You retain ownership of your photos. By uploading, you grant TinyTinyEvents a license 
              to display and process your content to provide our service.
            </p>
          </section>

          {/* Content Removal */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Content Removal Requests</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are an event organizer and would like your event removed from our platform, 
              please{" "}
              <Link to="/contact" className="text-primary hover:underline">
                contact us
              </Link>{" "}
              and we will remove it promptly. We respect organizers' wishes regarding how their
              events are promoted.
            </p>
          </section>

          {/* Prohibited Content */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Prohibited Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The following content is not allowed on TinyTinyEvents:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Fake or scam events</strong> with fraudulent ticket links designed to steal money or personal information</li>
              <li><strong>Misleading information</strong> intentionally designed to deceive users</li>
              <li><strong>Events promoting illegal activities</strong></li>
              <li><strong>Spam or duplicate postings</strong> of the same event</li>
              <li><strong>Phishing links</strong> or malicious URLs</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We reserve the right to remove any content that violates these guidelines without notice.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Links & Tickets</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Important:</strong> TinyTinyEvents does not sell tickets or verify external 
              ticket links. Event pages may contain links to third-party websites for ticket 
              purchases or more information. Any purchases made through these links are at your 
              own risk. We are not responsible for fraudulent or invalid tickets, payment issues, 
              or any transactions with third parties.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Always verify ticket sellers and be cautious when making online purchases.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TinyTinyEvents provides event information "as is" based on publicly displayed posters. 
              We are not responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Event cancellations, changes, or postponements</li>
              <li>Accuracy of event details (dates, times, venues, prices)</li>
              <li>Quality or safety of events</li>
              <li>Third-party ticket transactions</li>
              <li>Any losses resulting from attending or not attending events</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We recommend verifying event details with official organizer sources before making plans.
            </p>
          </section>

          {/* Accounts */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your account. We may suspend 
              or terminate accounts that violate these terms, post prohibited content, or engage 
              in behavior that harms the community.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of TinyTinyEvents after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms or to report content issues,{" "}
              <Link to="/contact" className="text-primary hover:underline">
                click here
              </Link>{" "}
              to get in touch.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

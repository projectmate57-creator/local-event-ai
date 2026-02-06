import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 6, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              TinyTinyEvents ("we", "our", "us") respects your privacy. This policy explains 
              what data we collect, how we use it, and your rights regarding your information.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Account Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Email address (for account creation and login)</li>
              <li>Authentication data from Google if you use Google Sign-In</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Event Content</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Photos of event posters you upload</li>
              <li>Event details extracted or entered (title, date, location, description)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Analytics data (event page views, clicks on ticket links)</li>
              <li>Browser type and device information</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Provide the service:</strong> Display events, manage your account, show your dashboard</li>
              <li><strong>AI processing:</strong> Our AI analyzes uploaded poster images to extract event details automatically</li>
              <li><strong>Analytics:</strong> Track event views and clicks to show you how your events perform</li>
              <li><strong>Communication:</strong> Send service-related emails (account verification, important updates)</li>
              <li><strong>Improve the service:</strong> Understand how users interact with our platform</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Google OAuth:</strong> For optional "Sign in with Google" functionality</li>
              <li><strong>AI Services:</strong> To process poster images and extract event information</li>
              <li><strong>Cloud Infrastructure:</strong> To securely store your data and serve our platform</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies & Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use cookies and local storage for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Authentication:</strong> To keep you logged in securely</li>
              <li><strong>Preferences:</strong> To remember your theme preference (light/dark mode)</li>
              <li><strong>Cookie consent:</strong> To remember if you've accepted our cookie notice</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not use cookies for advertising or tracking across other websites.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data and uploaded events for as long as your account is active. 
              If you delete your account, your personal data will be removed within 30 days, though 
              some anonymized analytics data may be retained.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:hello@tinytinyevents.com" className="text-primary hover:underline">
                hello@tinytinyevents.com
              </a>
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              TinyTinyEvents is not intended for users under the age of 16. We do not knowingly 
              collect personal information from children. If you believe a child has provided us 
              with personal data, please contact us.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your data, including encryption, 
              secure authentication, and access controls. However, no system is completely secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant 
              changes by updating the "Last updated" date at the top of this page.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or to exercise your data rights, contact us at{" "}
              <a href="mailto:hello@tinytinyevents.com" className="text-primary hover:underline">
                hello@tinytinyevents.com
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

"use client";

import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of Service | Nouvoice",
  description: "Terms of Service for Nouvoice - AI-powered invoice generation",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl mx-auto px-4 py-12 space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>

          <div className="space-y-4">
            <p>
              Welcome to Nouvoice. By accessing or using our service, you agree
              to be bound by these Terms of Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Use of Service</h2>
            <p>
              Nouvoice provides an AI-powered invoice generation platform for
              freelancers and small businesses. You may use our service only as
              permitted by law and according to these Terms. You are responsible
              for all activity that occurs under your account.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Account Registration
            </h2>
            <p>
              To use certain features of our service, you may need to create an
              account. You must provide accurate and complete information when
              creating your account and keep your account information updated.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Payment Terms</h2>
            <p>
              Some features of our service require payment. You agree to pay all
              fees associated with your use of our service. All payments are
              non-refundable unless otherwise specified.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Intellectual Property
            </h2>
            <p>
              Our service and its contents are protected by copyright,
              trademark, and other laws. You may not use our name, logo, or
              other proprietary information without our express written consent.
            </p>

            <h2 className="text-2xl font-semibold mt-8">User Content</h2>
            <p>
              You retain ownership of any content you submit to our service. By
              submitting content, you grant us a worldwide, non-exclusive,
              royalty-free license to use, reproduce, modify, and display your
              content in connection with providing our service.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Termination</h2>
            <p>
              We may terminate or suspend your account and access to our service
              at any time, without prior notice or liability, for any reason,
              including if you breach these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Disclaimer of Warranties
            </h2>
            <p>
              Our service is provided "as is" and "as available" without
              warranties of any kind, either express or implied.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Limitation of Liability
            </h2>
            <p>
              In no event shall Nouvoice be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or
              relating to your use of our service.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. If we make material
              changes, we will notify you through our service or by other means,
              such as email.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:contact@nouvoice.com.au"
                className="text-primary hover:underline"
              >
                contact@nouvoice.com.au
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nouvoice",
  description: "Privacy Policy for Nouvoice - AI-powered invoice generation",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>

      <div className="space-y-4">
        <p>
          At Nouvoice, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our service.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Information We Collect</h2>
        <p>
          We collect information that you provide directly to us when you use
          our service, including personal information such as your name, email
          address, and billing information. We also automatically collect
          certain information about your device and how you interact with our
          service.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          How We Use Your Information
        </h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, process transactions, send you technical notices and
          support messages, and respond to your comments and questions.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          Sharing Your Information
        </h2>
        <p>
          We do not share your personal information with third parties except as
          described in this privacy policy. We may share your information with
          service providers who perform services on our behalf, when required by
          law, or in connection with a merger, acquisition, or sale of all or a
          portion of our assets.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Data Security</h2>
        <p>
          We use reasonable measures to help protect your personal information
          from loss, theft, misuse, unauthorized access, disclosure, alteration,
          and destruction.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Your Choices</h2>
        <p>
          You can update your account information and email preferences at any
          time by logging into your account. You may also opt out of receiving
          promotional communications from us by following the instructions in
          those communications.
        </p>

        <h2 className="text-2xl font-semibold mt-8">
          Changes to This Privacy Policy
        </h2>
        <p>
          We may update this privacy policy from time to time. If we make
          material changes, we will notify you through our service or by other
          means, such as email.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
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
  );
}

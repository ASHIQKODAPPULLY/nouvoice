import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Nouvoice",
  description:
    "Learn about Nouvoice - Melbourne-Brewed Innovation for Smarter Business",
};

export default function AboutPage() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          About Nouvoice
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Melbourne-Brewed Innovation for Smarter Business
        </p>

        <div className="prose prose-lg dark:prose-invert">
          <p className="mb-4">
            Nouvoice was born out of a simple but frustrating reality: small
            business owners and freelancers were wasting countless hours
            manually creating invoices, cross-checking numbers, and managing
            outdated templates.
          </p>

          <p className="mb-4">
            Built in Melbourne, Nouvoice is the solution to this common pain
            point. We provide an AI-powered platform that lets you generate
            professional, compliant invoices in seconds—saving you time,
            improving accuracy, and letting you focus on what truly matters:
            your business.
          </p>

          <p className="mb-8">
            Our core mission is to empower customers with intuitive, intelligent
            invoicing tools that do the work for them. Whether you're a solo
            entrepreneur, consultant, or growing team, Nouvoice adapts to your
            workflow and scales with your ambition.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
          <p className="mb-4">
            We're a small team of developers, designers, and business experts
            based in Melbourne, Australia. With backgrounds in fintech, AI, and
            small business operations, we understand the challenges that
            entrepreneurs and freelancers face when it comes to financial
            management.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <p className="mb-6">
            Email us at:{" "}
            <a
              href="mailto:contact@nouvoice.com.au"
              className="text-blue-600 dark:text-blue-400"
            >
              contact@nouvoice.com.au
            </a>
          </p>

          <div className="mt-8">
            <Link href="/support" passHref>
              <Button>Visit Our Support Center</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

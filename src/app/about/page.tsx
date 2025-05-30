import { Metadata } from "next";
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

        <div className="space-y-4">
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

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-muted/30 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Simplicity</h3>
              <p className="text-muted-foreground">
                We believe powerful tools should be simple to use. Our platform
                strips away complexity to deliver an intuitive experience that
                anyone can master.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                By harnessing the latest in AI technology, we're constantly
                pushing the boundaries of what's possible in financial
                management software.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Reliability</h3>
              <p className="text-muted-foreground">
                Your business depends on accurate financial records. Our
                platform is built with enterprise-grade security and accuracy as
                top priorities.
              </p>
            </div>
            <div className="bg-muted/30 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Customer Focus</h3>
              <p className="text-muted-foreground">
                Every feature we build starts with understanding our users'
                needs. Your feedback directly shapes our product roadmap.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p className="mb-4">
            Nouvoice began as a side project to solve our own invoicing
            frustrations. What started as a simple tool quickly evolved as we
            discovered how many others shared the same pain points. Today, we're
            proud to serve thousands of businesses across Australia and beyond,
            helping them streamline their financial operations.
          </p>
          <p className="mb-8">
            Our journey is just beginning, and we're excited to continue
            building tools that give small businesses and freelancers the same
            financial capabilities as much larger enterprises.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
            <p className="mb-4">
              <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:contact@nouvoice.com.au"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                contact@nouvoice.com.au
              </a>
            </p>

            <p>
              <span className="font-medium">Support Hours:</span>{" "}
              <span className="text-muted-foreground">
                Monday to Friday, 9am - 5pm AEST
              </span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground italic">
            For technical support issues, please visit our{" "}
            <Link
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Support Center
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

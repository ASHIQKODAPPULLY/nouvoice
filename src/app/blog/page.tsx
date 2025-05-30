import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Blog | InvoiceGen",
  description:
    "Latest articles, tips, and news about invoicing and business management.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Latest articles, tips, and news about invoicing and business
          management.
        </p>

        <div className="mb-12">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
            alt="Professional looking at invoices on laptop"
            className="rounded-lg w-full object-cover h-64"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured blog post - full width */}
          <div className="border rounded-lg overflow-hidden bg-card col-span-1 md:col-span-2 lg:col-span-3">
            <div className="aspect-video bg-muted" />
            <div className="p-6">
              <p className="text-sm text-muted-foreground">June 10, 2023</p>
              <h3 className="text-xl font-semibold mt-2">
                Invoicing Best Practices for Freelancers: How to Get Paid Faster
                and More Reliably
              </h3>
              <div className="text-muted-foreground mt-4 space-y-4">
                <p>
                  As a freelancer, your work doesn't end when the project is
                  delivered. Getting paid—and getting paid on time—is a critical
                  part of sustaining your business. A well-structured and
                  professional invoice not only reflects your brand but also
                  reduces delays and disputes.
                </p>
                <p>
                  In this article, we'll explore best practices for freelance
                  invoicing and how a purpose-built tool like Nouvoice can save
                  you time, help you get paid faster, and give your clients a
                  smoother experience.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  1. Always Include the Essentials
                </h4>
                <p>
                  An incomplete invoice can delay payments or lead to
                  back-and-forth emails. Make sure every invoice includes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your name and contact details</li>
                  <li>Your client's name and business address</li>
                  <li>A unique invoice number</li>
                  <li>A clear breakdown of services and associated costs</li>
                  <li>Date of issue and payment due date</li>
                  <li>Total amount due, including any taxes</li>
                  <li>Accepted payment methods</li>
                </ul>
                <p>
                  With Nouvoice, these fields are automatically generated. This
                  alone can reduce invoice creation time by up to 80 percent,
                  allowing you to focus on billable work.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  2. Create a Branded, Professional Layout
                </h4>
                <p>
                  A consistent visual identity builds credibility. Your invoice
                  should match the quality of your work. Include your logo,
                  stick to a clean layout, and use legible fonts.
                </p>
                <p>
                  Nouvoice offers customizable templates that are professionally
                  designed, so you never need to worry about formatting.
                  Freelancers using Nouvoice have reported higher client
                  satisfaction and faster payment turnarounds—often by two to
                  three business days.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  3. Define Clear Payment Terms
                </h4>
                <p>
                  Ambiguous terms like "due soon" or "upon receipt" often lead
                  to late payments. Specify due dates (e.g., "within 7 days of
                  issue") and define any penalties or discounts.
                </p>
                <p>
                  Nouvoice allows you to set these terms once and apply them
                  across all invoices. On average, freelancers using structured
                  terms get paid 25 percent faster than those who don't.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  4. Provide Multiple Payment Options
                </h4>
                <p>
                  The easier it is for a client to pay, the faster you'll get
                  paid. Accepting multiple methods—such as bank transfer, credit
                  card, or PayPal—removes friction from the process.
                </p>
                <p>
                  Nouvoice allows you to link your preferred payment options
                  directly in your invoice, reducing time-to-payment and
                  improving client convenience.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  5. Automate Follow-Ups and Tracking
                </h4>
                <p>
                  Tracking invoices manually can lead to missed payments or
                  awkward follow-ups. Use a system that shows when an invoice is
                  sent, viewed, and paid.
                </p>
                <p>
                  Nouvoice includes real-time invoice tracking and sends polite,
                  automatic reminders for overdue payments. Freelancers using
                  these features have seen a 60 percent drop in late payments.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  6. Optimize for Mobile Viewing
                </h4>
                <p>
                  Over 70 percent of clients now open invoices on their phones.
                  If your invoice is hard to read on mobile, it may be ignored
                  or delayed.
                </p>
                <p>
                  Invoices generated with Nouvoice are mobile-optimized by
                  default, helping ensure quick action from clients.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  In Summary: A Better Invoice is a Faster Payment
                </h4>
                <p>
                  Your invoice is not just a payment request—it's part of your
                  client experience. A clear, professional invoice can mean the
                  difference between getting paid in 2 days versus 2 weeks.
                </p>
                <p>
                  Nouvoice is built specifically for freelancers and small
                  businesses in Australia. It's quick to set up,
                  mobile-friendly, and built to reduce admin time.
                </p>

                <h4 className="text-lg font-semibold mt-6 text-foreground">
                  Why Freelancers Are Switching to Nouvoice
                </h4>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Reduce invoice creation time by up to 80 percent</li>
                  <li>
                    Get paid up to 25 percent faster with built-in payment
                    reminders
                  </li>
                  <li>
                    Avoid late payments with smart tracking and follow-ups
                  </li>
                  <li>
                    Save time and stress—users report saving up to 5 hours per
                    week on invoicing tasks
                  </li>
                </ul>
                <p className="font-medium mt-4">
                  Start sending better invoices in minutes.
                  <br />
                  Visit nouvoice.com.au and send your first invoice free.
                </p>
              </div>
              <a
                href="#"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Read more
              </a>
            </div>
          </div>

          {/* Other blog posts */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="aspect-video bg-muted" />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">April 22, 2023</p>
              <h3 className="text-lg font-semibold mt-2">
                Tax Deductions Every Small Business Should Know
              </h3>
              <p className="text-muted-foreground mt-2">
                Maximize your tax savings with these essential deductions.
              </p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="aspect-video bg-muted" />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">March 10, 2023</p>
              <h3 className="text-lg font-semibold mt-2">
                How AI is Transforming Financial Management
              </h3>
              <p className="text-muted-foreground mt-2">
                Discover how AI tools like InvoiceGen are changing the game.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

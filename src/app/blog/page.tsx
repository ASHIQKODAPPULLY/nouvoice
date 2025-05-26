import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | InvoiceGen",
  description:
    "Latest articles, tips, and news about invoicing and business management.",
};

export default function BlogPage() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-6">Blog</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Latest articles, tips, and news about invoicing and business management.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blog post cards would go here */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="aspect-video bg-muted" />
          <div className="p-4">
            <p className="text-sm text-muted-foreground">May 15, 2023</p>
            <h3 className="text-lg font-semibold mt-2">
              Invoicing Best Practices for Freelancers
            </h3>
            <p className="text-muted-foreground mt-2">
              Learn how to create professional invoices that get you paid
              faster.
            </p>
          </div>
        </div>

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
    </div>
  );
}

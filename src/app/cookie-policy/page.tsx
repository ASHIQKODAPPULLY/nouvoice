import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Nouvoice",
  description: "Cookie Policy for Nouvoice - AI-powered invoice generation",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container max-w-4xl mx-auto px-4 py-12 space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>

          <div className="space-y-4">
            <p>
              This Cookie Policy explains how Nouvoice uses cookies and similar
              technologies to recognize you when you visit our website. It
              explains what these technologies are and why we use them, as well
              as your rights to control our use of them.
            </p>

            <h2 className="text-2xl font-semibold mt-8">What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. Cookies are widely used by
              website owners to make their websites work, or to work more
              efficiently, as well as to provide reporting information.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Why Do We Use Cookies?
            </h2>
            <p>
              We use cookies for several reasons. Some cookies are required for
              technical reasons for our website to operate, while others enable
              us to track and target the interests of our users to enhance the
              experience on our website. For example, we use cookies to keep
              track of your preferences, analyze how you use our website, and
              personalize content.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Types of Cookies We Use
            </h2>
            <p>
              <strong>Essential Cookies:</strong> These cookies are necessary
              for the website to function and cannot be switched off in our
              systems. They are usually only set in response to actions made by
              you which amount to a request for services, such as setting your
              privacy preferences, logging in, or filling in forms.
            </p>
            <p>
              <strong>Performance Cookies:</strong> These cookies allow us to
              count visits and traffic sources so we can measure and improve the
              performance of our site. They help us to know which pages are the
              most and least popular and see how visitors move around the site.
            </p>
            <p>
              <strong>Functionality Cookies:</strong> These cookies enable the
              website to provide enhanced functionality and personalization.
              They may be set by us or by third-party providers whose services
              we have added to our pages.
            </p>
            <p>
              <strong>Targeting Cookies:</strong> These cookies may be set
              through our site by our advertising partners. They may be used by
              those companies to build a profile of your interests and show you
              relevant advertisements on other sites.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              How to Control Cookies
            </h2>
            <p>
              You can set or amend your web browser controls to accept or refuse
              cookies. If you choose to reject cookies, you may still use our
              website though your access to some functionality and areas of our
              website may be restricted. As the means by which you can refuse
              cookies through your web browser controls vary from browser to
              browser, you should visit your browser's help menu for more
              information.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Changes to This Cookie Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. If we make
              material changes, we will notify you through our service or by
              other means, such as email.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
            <p>
              If you have any questions about this Cookie Policy, please contact
              us at{" "}
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

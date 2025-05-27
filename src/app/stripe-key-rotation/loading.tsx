export default function Loading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation Management
      </h1>
      <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
        <p className="text-center mt-4">Loading key management interface...</p>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

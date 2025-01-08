import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-xl",
          }
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
} 
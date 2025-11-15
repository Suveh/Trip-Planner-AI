import React, { useRef, useState } from "react";
import { SimpleInput } from "@/components/ui/SimpleInput";

function SignInForm() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState("");

  const handleSignIn = () => {
    if (!emailRef.current.value.includes("@")) {
      setError("Invalid email");
      return;
    }
    setError("");
    console.log("Signing in...");
  };

  return (
    <div className="w-96 p-5">
      <SimpleInput
        ref={emailRef}
        type="email"
        placeholder="Email"
        error={error}
        className="mb-3"
      />
      <SimpleInput
        ref={passwordRef}
        type="password"
        placeholder="Password"
        className="mb-3"
      />
      <button
        onClick={handleSignIn}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Sign In
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default SignInForm;

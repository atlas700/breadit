"use client";

import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Icons } from "./Icons";
import { Button } from "./ui/Button";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      signIn("google");
    } catch (error) {
      toast({
        title: "There was an error",
        description: "There was an error signing in with google, try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex flex-col mx-auto w-full justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="w-6 h-6 mx-auto" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you setting up a breadit account and agree with our
          User Agreement and Privacy Policy.
        </p>
        {/* sign up form */}
        <div className="flex justify-center">
          <Button size={"sm"} className="w-full" onClick={signInWithGoogle}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Icons.google className="w-4 h-4 mr-2" />
            )}
            Google
          </Button>
        </div>

        <p className="text-zinc-700 text-sm text-center px-8">
          New To Breadit?
          <Link
            href="/sign-up"
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

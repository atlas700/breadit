import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import SignUp from "@/components/SignUp";

const page = () => {
  return (
    <div className="absolute inset-0">
      <div className="h-full mx-auto max-w-2xl flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Home
        </Link>

        <SignUp />
      </div>
    </div>
  );
};

export default page;

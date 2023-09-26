import Link from "next/link";
import { Icons } from "./Icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/Button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import SearchBar from "./SearchBar";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit py-2 bg-zinc-100 border-b border-zinc-300 z-[10]">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6" />
          <p className="hidden md:block text-zinc-700 text-sm font-medium">
            Breadit
          </p>
        </Link>
        {/* Search Bar TODO: */}

        <SearchBar />

        {/* Link */}
        {session?.user ? (
          <UserAccountNav
            user={{
              name: session?.user.name,
              image: session?.user.image,
              email: session?.user.email,
            }}
          />
        ) : (
          <Link href="/sign-in" className={cn(buttonVariants(), "py-2 px-4")}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;

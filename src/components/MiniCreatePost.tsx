"use client";

import { Session } from "next-auth";
import { FC } from "react";
import { UserAvatar } from "./UserAvatar";
import { Input } from "./ui/Input";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { ImageIcon, Link2 } from "lucide-react";

interface MiniCreatePostProps {
  session: Session | null;
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({ session }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <li className="overflow-hidden rounded bg-white shadow">
      <div className="py-4 px-6 h-full flex justify-between gap-6">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || "",
              image: session?.user.image || null,
            }}
          />

          <span className="w-3 h-3 outline outline-2 outline-white bg-green-500 rounded-full absolute bottom-0 right-0" />
        </div>

        <Input
          readOnly
          placeholder="Create post"
          onClick={() => router.push(pathname + "/submit")}
        />

        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant={"ghost"}
        >
          <Link2 className="text-zinc-600" />
        </Button>

        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant={"ghost"}
        >
          <ImageIcon className="text-zinc-600" />
        </Button>
      </div>
    </li>
  );
};

export default MiniCreatePost;

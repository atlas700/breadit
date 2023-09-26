"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCustomToasts } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const [input, setInput] = useState<string>("");

  const { loginToast } = useCustomToasts();

  const router = useRouter();
  const { mutate: createSubreddit, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };

      const { data } = await axios.post("/api/subreddit/create", payload);

      return data as string;
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
        if (error.response?.status === 409) {
          return toast({
            title: "Error",
            description:
              "There was a community exist by the same name, please try with other name.",
            variant: "destructive",
          });
        }
        if (error.response?.status === 400) {
          return toast({
            title: "Error",
            description: "Bad request, try again.",
            variant: "destructive",
          });
        }
      }
      return toast({
        title: "Error",
        description: "Internal Server Error, please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (data) => {
      return router.push(`/r/${data}`);
    },
  });

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative space-y-6 w-full-h-fit-rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <hr className="h-px bg-zinc-500" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <p className="text-xs pb-2">
            Community names including capitalization cannot be changed.
          </p>

          <div className="relative ">
            <p className="absolute inset-y-0 left-0 text-sm w-8 grid place-items-center text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              placeholder="community name"
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            size={"sm"}
            onClick={() => createSubreddit()}
          >
            Create{" "}
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;

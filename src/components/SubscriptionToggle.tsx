"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useCustomToasts } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SubscriptionToggleProps {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

const SubscriptionToggle: FC<SubscriptionToggleProps> = ({
  subredditId,
  isSubscribed,
  subredditName,
}) => {
  const router = useRouter();

  const { loginToast } = useCustomToasts();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);

      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Error",
        description: "Unknown error occurred.",
        variant: "destructive",
      });
    },

    onSuccess: (data) => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Successfully joined",
        description: `You are successfully subscribed to r/${subredditName}`,
      });
    },
  });

  const { mutate: unSubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);

      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Error",
        description: "Unknown error occurred.",
        variant: "destructive",
      });
    },

    onSuccess: (data) => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Successfully Leave",
        description: `You are successfully Leave from r/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button className="w-full mt-1 mb-4" onClick={() => unSubscribe()}>
      Leave community
      {isUnsubLoading ? (
        <Loader2 className="w-4 h-4 animate-spin ml-2" />
      ) : null}
    </Button>
  ) : (
    <Button className="w-full mt-1 mb-4" onClick={() => subscribe()}>
      Join to posts
      {isSubLoading ? (
        <Loader2 className="w-4 h-4 animate-spin ml-2" />
      ) : null}{" "}
    </Button>
  );
};

export default SubscriptionToggle;

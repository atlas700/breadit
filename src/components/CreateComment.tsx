"use client";

import { FC, useState } from "react";
import { Textarea } from "./ui/Textarea";
import { Label } from "./ui/Label";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { useCustomToasts } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CreateCommentProps {
  postId: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId }) => {
  const [commentText, setCommentText] = useState<string>("");

  const router = useRouter();

  const { loginToast } = useCustomToasts();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, replyToId, text }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        replyToId,
        text,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status == 401) {
          return loginToast();
        }
      }
      return toast({
        title: "There was an error.",
        description: "Creating comment failed, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();

      toast({
        description: "Successfully create the comment",
      });

      setCommentText("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label>Your comment</Label>
      <div className="flex mt-2 items-center">
        <Textarea
          placeholder="Your thought's about the post..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={1}
        />
      </div>
      <div className="flex justify-end gap-y-3">
        <Button
          disabled={commentText.length === 0}
          onClick={() =>
            comment({
              postId,
              text: commentText,
            })
          }
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CreateComment;

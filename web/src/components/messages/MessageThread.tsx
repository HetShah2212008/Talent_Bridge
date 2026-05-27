"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/actions/messages";
import { toast } from "sonner";
import { displayName } from "@/lib/utils/user-display";

type MessageItem = {
  id: string;
  text: string;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export function MessageThread({
  applicationId,
  messages,
  currentUserId,
}: {
  applicationId: string;
  messages: MessageItem[];
  currentUserId: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await sendMessage(applicationId, text);
      setText("");
      toast.success("Message sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === currentUserId;
            const name = displayName(msg.sender);
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs opacity-80 mb-1">{name}</p>
                  <p>{msg.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="resize-none"
        />
        <Button type="submit" disabled={loading} className="self-end">
          Send
        </Button>
      </form>
    </div>
  );
}

import { parsePartialJson } from "@langchain/core/output_parsers";
import { useStreamContext } from "@/app/(auth)/vertex/providers/Stream";
import { AIMessage, Checkpoint, Message } from "@langchain/langgraph-sdk";
import { getContentString } from "../utils";
import { BranchSwitcher, CommandBar } from "./shared";
import { MarkdownText } from "../markdown-text";
import { SelectableContent } from "../selectable-content";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { cn } from "@/lib/utils";
import { ToolCalls, ToolResult } from "./tool-calls";
import { MessageContentComplex } from "@langchain/core/messages";
import { Fragment } from "react/jsx-runtime";
import { isAgentInboxInterruptSchema } from "@/app/(auth)/vertex/lib/agent-inbox-interrupt";
import { ThreadView } from "../agent-inbox";
import { useQueryState, parseAsBoolean } from "nuqs";
import { GenericInterruptView } from "./generic-interrupt";
import components from "@/app/(auth)/vertex/custom_components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Brain } from "lucide-react";

function CustomComponent({
  message,
  thread,
}: {
  message: Message;
  thread: ReturnType<typeof useStreamContext>;
}) {
  const { values } = useStreamContext();
  const customComponents = values.ui?.filter(
    (ui) => ui.metadata?.message_id === message.id,
  );

  if (!customComponents?.length) return null;
  return (
    <Fragment key={message.id}>
      {customComponents.map((customComponent) => (
        <LoadExternalComponent
          key={customComponent.id}
          stream={thread}
          message={customComponent}
          meta={{ ui: customComponent }}
          components={components as any}
        />
      ))}
    </Fragment>
  );
}

function parseAnthropicStreamedToolCalls(
  content: MessageContentComplex[],
): AIMessage["tool_calls"] {
  const toolCallContents = content.filter((c) => c.type === "tool_use" && c.id);

  return toolCallContents.map((tc) => {
    const toolCall = tc as Record<string, any>;
    let json: Record<string, any> = {};
    if (toolCall?.input) {
      try {
        json = parsePartialJson(toolCall.input) ?? {};
      } catch {
        // Pass
      }
    }
    return {
      name: toolCall.name ?? "",
      id: toolCall.id ?? "",
      args: json,
      type: "tool_call",
    };
  });
}

export function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: {
  message: Message | undefined;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );

  const thread = useStreamContext();
  const isLastMessage =
    thread.messages[thread.messages.length - 1].id === message?.id;
  const hasNoAIOrToolMessages = !thread.messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );
  const meta = message ? thread.getMessagesMetadata(message) : undefined;
  const threadInterrupt = thread.interrupt;

  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;
  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  // Check if this is a thinking message
  const isThinkingMessage = message && 'name' in message && message.name === "thinking";
  
  // If this is a thinking message, collect all consecutive thinking messages
  const getConsecutiveThinkingMessages = () => {
    if (!isThinkingMessage) return [];
    
    const currentMessageIndex = thread.messages.findIndex(m => m.id === message?.id);
    const thinkingMessages = [];
    
    // Look backwards from current message to find all consecutive thinking messages
    for (let i = currentMessageIndex; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.type === "ai" && 'name' in msg && msg.name === "thinking") {
        thinkingMessages.unshift(msg);
      } else {
        break;
      }
    }
    
    // Look forwards from current message to find all consecutive thinking messages
    for (let i = currentMessageIndex + 1; i < thread.messages.length; i++) {
      const msg = thread.messages[i];
      if (msg.type === "ai" && 'name' in msg && msg.name === "thinking") {
        thinkingMessages.push(msg);
      } else {
        break;
      }
    }
    
    return thinkingMessages;
  };

  const consecutiveThinkingMessages = getConsecutiveThinkingMessages();
  const shouldShowThinkingAccordion = isThinkingMessage && consecutiveThinkingMessages.length > 0;
  
  // Only render the accordion for the first thinking message in a sequence
  const isFirstThinkingInSequence = shouldShowThinkingAccordion && 
    consecutiveThinkingMessages[0]?.id === message?.id;

  const hasToolCalls =
    message &&
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;
  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some(
      (tc) => tc.args && Object.keys(tc.args).length > 0,
    );
  const hasAnthropicToolCalls = !!anthropicStreamedToolCalls?.length;
  const isToolResult = message?.type === "tool";

  if (isToolResult && hideToolCalls) {
    return null;
  }

  // Don't render individual thinking messages, only the accordion
  if (isThinkingMessage && !isFirstThinkingInSequence) {
    return null;
  }

  return (
    <div className="flex items-start mr-auto gap-2 group">
      {isToolResult ? (
        <ToolResult message={message} />
      ) : isFirstThinkingInSequence ? (
        <div className="flex flex-col gap-2 w-full">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="thinking-messages" className="border-b border-gray-200">
              <AccordionTrigger className="py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Thinking ({consecutiveThinkingMessages.length} step{consecutiveThinkingMessages.length > 1 ? 's' : ''})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <div className="space-y-3">
                  {consecutiveThinkingMessages.map((thinkingMsg, index) => {
                    const thinkingContent = getContentString(thinkingMsg.content ?? []);
                    return (
                      <div key={thinkingMsg.id || index} className="border-l-2 border-blue-200 pl-3">
                        <div className="text-xs text-gray-500 mb-1">Step {index + 1}</div>
                        <SelectableContent messageId={thinkingMsg.id} className="py-1">
                          <MarkdownText>{thinkingContent}</MarkdownText>
                        </SelectableContent>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {contentString.length > 0 && (
            <SelectableContent messageId={message?.id} className="py-1">
              <MarkdownText>{contentString}</MarkdownText>
            </SelectableContent>
          )}

          {!hideToolCalls && (
            <>
              {(hasToolCalls && toolCallsHaveContents && (
                <ToolCalls toolCalls={message.tool_calls} />
              )) ||
                (hasAnthropicToolCalls && (
                  <ToolCalls toolCalls={anthropicStreamedToolCalls} />
                )) ||
                (hasToolCalls && <ToolCalls toolCalls={message.tool_calls} />)}
            </>
          )}

          {message && <CustomComponent message={message} thread={thread} />}
          {isAgentInboxInterruptSchema(threadInterrupt?.value) &&
            (isLastMessage || hasNoAIOrToolMessages) && (
              <ThreadView interrupt={threadInterrupt.value} />
            )}
          {threadInterrupt?.value &&
          !isAgentInboxInterruptSchema(threadInterrupt.value) &&
          isLastMessage ? (
            <GenericInterruptView interrupt={threadInterrupt.value} />
          ) : null}
          <div
            className={cn(
              "flex gap-2 items-center mr-auto transition-opacity",
              "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
            )}
          >
            <BranchSwitcher
              branch={meta?.branch}
              branchOptions={meta?.branchOptions}
              onSelect={(branch) => thread.setBranch(branch)}
              isLoading={isLoading}
            />
            <CommandBar
              content={contentString}
              isLoading={isLoading}
              isAiMessage={true}
              handleRegenerate={() => handleRegenerate(parentCheckpoint)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AssistantMessageLoading() {
  return (
    <div className="flex items-start mr-auto gap-2">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2 h-8">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_1s_infinite]"></div>
      </div>
    </div>
  );
}

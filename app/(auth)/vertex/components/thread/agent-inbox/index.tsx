import { StateView } from "./components/state-view";
import { ThreadActionsView } from "./components/thread-actions-view";
import { useState } from "react";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { useStreamContext } from "@/app/(auth)/vertex/providers/Stream";

interface ThreadViewProps {
  interrupt: HumanInterrupt | HumanInterrupt[];
}

export function ThreadView({ interrupt }: ThreadViewProps) {
  const interruptObj = Array.isArray(interrupt) ? interrupt[0] : interrupt;
  const thread = useStreamContext();
  const [showDescription, setShowDescription] = useState(false);
  const [showState, setShowState] = useState(false);
  const showSidePanel = showDescription || showState;

  const handleShowSidePanel = (
    showState: boolean,
    showDescription: boolean,
  ) => {
    if (showState && showDescription) {
      console.error("Cannot show both state and description");
      return;
    }
    if (showState) {
      setShowDescription(false);
      setShowState(true);
    } else if (showDescription) {
      setShowState(false);
      setShowDescription(true);
    } else {
      setShowState(false);
      setShowDescription(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[80vh] p-8 bg-gray-50/50 rounded-2xl overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {showSidePanel ? (
        <StateView
          handleShowSidePanel={handleShowSidePanel}
          description={interruptObj.description}
          values={thread.values}
          view={showState ? "state" : "description"}
        />
      ) : (
        <ThreadActionsView
          interrupt={interruptObj}
          handleShowSidePanel={handleShowSidePanel}
          showState={showState}
          showDescription={showDescription}
        />
      )}
    </div>
  );
}

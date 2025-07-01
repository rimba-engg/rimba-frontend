import { EventSourcePolyfill } from "event-source-polyfill";

;(window as any).EventSource = EventSourcePolyfill;

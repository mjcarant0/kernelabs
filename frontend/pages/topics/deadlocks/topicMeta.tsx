/* Central configuration for the Deadlocks topic */

import { TopicConfig } from "../shared/types";

export const deadlocksConfig: TopicConfig = {
  id: "deadlocks",
  name: "Deadlocks",
  description:
    "Understand the conditions that cause deadlocks, how to characterize them using resource-allocation graphs, and the strategies used to prevent, avoid, detect, and recover from deadlocks in operating systems.",
  shortDescription: "Deadlock Detection, Prevention, and Recovery",
};

// For future scalability - topic routing
export const topicList = [
  {
    id: "introduction",
    name: "Introduction to Operating Systems",
    shortDescription: "Foundations of Operating Systems",
    href: "/topics/introduction",
  },
  {
    id: "deadlocks",
    name: "Deadlocks",
    shortDescription: "Deadlock Detection, Prevention, and Recovery",
    href: "/topics/deadlocks",
  },
  // Future topics can be added here
];

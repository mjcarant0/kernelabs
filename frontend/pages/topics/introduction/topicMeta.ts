/* Central configuration for the Introduction topic */

import { TopicConfig } from "../shared/types";

export const introductionConfig: TopicConfig = {
  id: "introduction",
  name: "Introduction to Operating Systems",
  description:
    "Learn the fundamental concepts of Operating Systems. Understand what an OS is, its history, and core functions in modern computing.",
  shortDescription: "Foundations of Operating Systems",
};

// For future scalability - topic routing
export const topicList = [
  {
    id: "introduction",
    name: "Introduction to Operating Systems",
    shortDescription: "Foundations of Operating Systems",
    href: "/topics/introduction",
  },
  // Future topics can be added here
  // {
  //   id: "file-systems",
  //   name: "File Systems",
  //   shortDescription: "Managing data storage",
  //   href: "/topics/file-systems",
  // },
];

import type { LocalProject, MarketAnalysis } from "./local-demo";

export type TrafficKit = {
  headline: string;
  linkedinPost: string;
  xPost: string;
  redditPost: string;
  outreachMessage: string;
  interviewQuestions: string[];
};

export function buildTrafficKit(project: LocalProject, market: MarketAnalysis): TrafficKit {
  const idea = project.input.idea;
  const icp = project.input.icp;
  const value = project.input.value.replace(/\.$/, "");
  const wedge = market.entryWedge;
  const channel = market.recommendedChannel;

  const headline = `${idea} traffic kit`;

  const linkedinPost = [
    `I’m validating a new product for ${icp.toLowerCase()}.`,
    "",
    `The core promise: ${value}.`,
    `The wedge I’m testing first is ${wedge.toLowerCase()}.`,
    "",
    `If this problem is relevant to you, I’d love 10 minutes of feedback or a signup on the early landing page.`,
    "",
    `Reply “interested” and I’ll send the link.`,
  ].join("\n");

  const xPost = `Validating a new startup for ${icp.toLowerCase()}: ${value.toLowerCase()}. Testing a narrow wedge around ${wedge.toLowerCase()}. Looking for 5 people to react to the landing page and tell me if this pain is real. Reply or DM if interested.`;

  const redditPost = [
    `I’m researching a product for ${icp.toLowerCase()}.`,
    "",
    `The idea is simple: ${value}.`,
    `I’m not selling anything yet — I’m trying to understand whether ${wedge.toLowerCase()} is painful enough to justify building a real MVP.`,
    "",
    `Two questions:`,
    `1. How are you solving this today?`,
    `2. What would make you try a new solution?`,
    "",
    `If useful, I can also share the landing page I’m testing for feedback.`,
  ].join("\n");

  const outreachMessage = `Hey — I’m validating a product for ${icp.toLowerCase()} and the promise is: ${value.toLowerCase()}. I’m testing whether ${wedge.toLowerCase()} is painful enough to deserve a real product. Would you be open to a 10-minute reaction call or a quick look at the landing page?`;

  const interviewQuestions = [
    `When does the problem behind “${value}” show up most often for you?`,
    `How are you handling this today, and what is still frustrating about it?`,
    `If a product solved this well, what result would matter most to you?`,
    `How urgent is this compared with the other problems on your plate right now?`,
    `What would make you trust a new tool enough to try it?`,
    `Would you prefer discovering this through ${channel.toLowerCase()} or through direct outreach?`,
  ];

  return {
    headline,
    linkedinPost,
    xPost,
    redditPost,
    outreachMessage,
    interviewQuestions,
  };
}

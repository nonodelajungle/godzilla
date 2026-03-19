import type { LocalProject, MarketAnalysis } from "./local-demo";

export type MarketStudy = {
  demandSignal: "Strong" | "Moderate" | "Weak";
  marketSizeProxy: "Large" | "Medium" | "Niche";
  spendingPower: "High" | "Medium" | "Low";
  saturation: "High" | "Medium" | "Low";
  searchIntent: "High" | "Medium" | "Low";
  buyingMotion: string;
  demandEvidence: string[];
  competitorPatterns: string[];
  recommendedMoves: string[];
  summary: string;
};

export function buildMarketStudy(project: LocalProject, market: MarketAnalysis): MarketStudy {
  const text = `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase();
  const demandScore = getDemandScore(text, market);
  const spendingScore = getSpendingScore(text, market);
  const marketSizeScore = getMarketSizeScore(text, market);
  const saturationScore = getSaturationScore(text, market);
  const searchScore = getSearchScore(text, market);

  const demandSignal = demandScore >= 4 ? "Strong" : demandScore >= 2 ? "Moderate" : "Weak";
  const marketSizeProxy = marketSizeScore >= 3 ? "Large" : marketSizeScore === 2 ? "Medium" : "Niche";
  const spendingPower = spendingScore >= 3 ? "High" : spendingScore === 2 ? "Medium" : "Low";
  const saturation = saturationScore >= 3 ? "High" : saturationScore === 2 ? "Medium" : "Low";
  const searchIntent = searchScore >= 3 ? "High" : searchScore === 2 ? "Medium" : "Low";

  const buyingMotion = buildBuyingMotion(project, market);
  const demandEvidence = buildDemandEvidence(project, market, demandSignal, searchIntent);
  const competitorPatterns = buildCompetitorPatterns(project, market, saturation);
  const recommendedMoves = buildRecommendedMoves(project, market, demandSignal, saturation, spendingPower);

  const summary = `${demandSignal} demand signal in a ${marketSizeProxy.toLowerCase()} market proxy, with ${spendingPower.toLowerCase()} spending power and ${saturation.toLowerCase()} saturation. Best first move: ${recommendedMoves[0].toLowerCase()}`;

  return {
    demandSignal,
    marketSizeProxy,
    spendingPower,
    saturation,
    searchIntent,
    buyingMotion,
    demandEvidence,
    competitorPatterns,
    recommendedMoves,
    summary,
  };
}

function getDemandScore(text: string, market: MarketAnalysis) {
  let score = 1;
  if (market.buyerUrgency === "High") score += 2;
  if (/(save|revenue|sales|automation|manual|compliance|cost|pipeline|deadline|time)/.test(text)) score += 1;
  if (/(nice to have|inspiration|discover|fun|community)/.test(text)) score -= 1;
  return Math.max(1, Math.min(5, score));
}

function getSpendingScore(text: string, market: MarketAnalysis) {
  if (/(enterprise|b2b|agencies|saas|sales|finance|ops|legal|healthcare|compliance)/.test(text)) return 3;
  if (market.segment === "Prosumer") return 2;
  if (/(students|hobby|free|social|community)/.test(text)) return 1;
  return market.segment === "Consumer" ? 1 : 2;
}

function getMarketSizeScore(text: string, market: MarketAnalysis) {
  if (/(small business|teams|companies|creators|freelancers|parents|students|marketing)/.test(text)) return 3;
  if (/(dentists|law firms|shopify stores|real estate agents|recruiters)/.test(text)) return 2;
  return market.segment === "B2B" ? 2 : 3;
}

function getSaturationScore(text: string, market: MarketAnalysis) {
  if (market.competitivePressure === "High") return 3;
  if (/(ai|crm|analytics|project management|design|content|fitness)/.test(text)) return 3;
  if (/(workflow|ops|automation|dashboard)/.test(text)) return 2;
  return 1;
}

function getSearchScore(text: string, market: MarketAnalysis) {
  if (market.buyerUrgency === "High") return 3;
  if (/(tool|software|platform|automation|generator|template)/.test(text)) return 2;
  return market.segment === "Consumer" ? 2 : 3;
}

function buildBuyingMotion(project: LocalProject, market: MarketAnalysis) {
  if (market.segment === "B2B") return `Likely founder-led or team-led purchase for ${project.input.icp.toLowerCase()}, with evaluation driven by ROI and workflow pain.`;
  if (market.segment === "Prosumer") return `Likely self-serve purchase if the time-saving payoff is obvious within the first week.`;
  return `Likely impulse-to-consideration motion, where trust, social proof, and visible outcome matter more than deep feature depth.`;
}

function buildDemandEvidence(project: LocalProject, market: MarketAnalysis, demandSignal: MarketStudy["demandSignal"], searchIntent: MarketStudy["searchIntent"]) {
  return [
    `Problem framing suggests ${demandSignal.toLowerCase()} demand among ${project.input.icp.toLowerCase()}.`,
    `${searchIntent} search intent is likely because buyers can describe the pain in practical terms.`,
    `The wedge “${market.entryWedge}” is concrete enough to test with landing pages and direct outreach.`,
  ];
}

function buildCompetitorPatterns(project: LocalProject, market: MarketAnalysis, saturation: MarketStudy["saturation"]) {
  return [
    `${saturation} saturation means you should avoid horizontal positioning around “all-in-one” value claims.`,
    `Competitors are likely already selling broader workflows, so your edge should be a narrow entry wedge for ${project.input.icp.toLowerCase()}.`,
    `Winning position probably comes from speed-to-value and sharper messaging, not from feature breadth.`,
  ];
}

function buildRecommendedMoves(project: LocalProject, market: MarketAnalysis, demandSignal: MarketStudy["demandSignal"], saturation: MarketStudy["saturation"], spendingPower: MarketStudy["spendingPower"]) {
  const moves = [
    `Lead with ${market.entryWedge} instead of the full product vision.`,
    `Use ${market.recommendedChannel.toLowerCase()} as the first acquisition channel.`,
  ];

  if (demandSignal === "Strong" && spendingPower !== "Low") moves.push("Test pricing or paid intent earlier than usual.");
  if (saturation === "High") moves.push(`Differentiate for ${project.input.icp.toLowerCase()} with a single outcome, not a generic AI angle.`);
  if (market.segment === "Consumer") moves.push("Use social proof and quick before/after outcomes in the first fold.");
  if (market.segment === "B2B") moves.push("Pair landing tests with founder-led outreach and 10-minute calls.");

  return moves.slice(0, 4);
}

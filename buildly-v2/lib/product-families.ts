export type ProductFamily =
  | "marketplace_booking"
  | "commerce_storefront"
  | "delivery_local"
  | "finance_copilot"
  | "education_path"
  | "recruiting_pipeline"
  | "creator_membership"
  | "team_workspace"
  | "support_hub";

export type DesignLanguage =
  | "trust_marketplace"
  | "premium_commerce"
  | "fast_local_ordering"
  | "data_finance"
  | "guided_learning"
  | "talent_ops"
  | "creator_premium"
  | "collab_workspace"
  | "support_ops";

export type NavigationPattern =
  | "search_first"
  | "storefront"
  | "geo_ordering"
  | "sidebar_dashboard"
  | "curriculum_path"
  | "jobs_and_tracker"
  | "creator_hub"
  | "workspace_sidebar"
  | "inbox_first";

export type PagePrimitive =
  | "search_bar"
  | "filter_panel"
  | "listing_grid"
  | "detail_page"
  | "wishlist"
  | "messaging"
  | "booking_flow"
  | "catalog_grid"
  | "product_page"
  | "cart"
  | "checkout"
  | "order_summary"
  | "eta_tracking"
  | "dashboard"
  | "analytics_cards"
  | "budget_widget"
  | "cashflow_chart"
  | "wealth_breakdown"
  | "alerts_feed"
  | "curriculum"
  | "lesson_player"
  | "progress_tracker"
  | "certificate_block"
  | "job_search"
  | "job_tracker"
  | "application_status"
  | "candidate_queue"
  | "membership_tiers"
  | "gated_content"
  | "community_chat"
  | "feed"
  | "channels"
  | "tasks"
  | "workflow_builder"
  | "huddles"
  | "ai_search"
  | "support_widget"
  | "ticket_queue"
  | "ticket_detail"
  | "sla_panel";

export type FamilyTemplate = {
  family: ProductFamily;
  label: string;
  designLanguage: DesignLanguage;
  navigation: NavigationPattern;
  pages: string[];
  primitives: PagePrimitive[];
  trustSignals: string[];
  retentionLoop: string[];
  opsSurface: string[];
  defaultTheme: "cyan" | "violet" | "emerald" | "amber" | "indigo" | "rose";
};

export const FAMILY_TEMPLATES: Record<ProductFamily, FamilyTemplate> = {
  marketplace_booking: {
    family: "marketplace_booking",
    label: "Marketplace Booking",
    designLanguage: "trust_marketplace",
    navigation: "search_first",
    pages: ["landing", "search_results", "listing_detail", "wishlist", "messages", "booking_checkout", "provider_dashboard"],
    primitives: ["search_bar", "filter_panel", "listing_grid", "detail_page", "wishlist", "messaging", "booking_flow"],
    trustSignals: ["ratings_reviews", "verified_profiles", "availability", "cancellation_policy", "payment_terms", "accessibility_info"],
    retentionLoop: ["wishlist", "saved_searches", "price_or_availability_alerts", "rebooking"],
    opsSurface: ["listing_management", "calendar_availability", "booking_management", "message_center", "review_moderation"],
    defaultTheme: "amber",
  },
  commerce_storefront: {
    family: "commerce_storefront",
    label: "Commerce Storefront",
    designLanguage: "premium_commerce",
    navigation: "storefront",
    pages: ["landing", "product_discovery", "product_detail", "cart", "checkout_summary", "order_confirmation", "orders"],
    primitives: ["catalog_grid", "product_page", "cart", "checkout", "order_summary"],
    trustSignals: ["delivery_estimate", "returns_policy", "secure_checkout", "ratings_reviews", "promo_visibility"],
    retentionLoop: ["persistent_cart", "abandoned_cart_recovery", "reorder", "recommended_products"],
    opsSurface: ["catalog_management", "inventory", "orders", "promotions", "shipping_rules"],
    defaultTheme: "amber",
  },
  delivery_local: {
    family: "delivery_local",
    label: "Local Delivery",
    designLanguage: "fast_local_ordering",
    navigation: "geo_ordering",
    pages: ["landing", "product_discovery", "merchant_menu", "cart", "checkout_summary", "order_tracking"],
    primitives: ["search_bar", "listing_grid", "cart", "checkout", "eta_tracking"],
    trustSignals: ["open_now", "delivery_eta", "ratings_reviews", "price_range", "fees_visibility"],
    retentionLoop: ["reorder", "favorites", "promo_offers", "status_notifications"],
    opsSurface: ["menu_management", "order_status", "substitutions", "delivery_dispatch"],
    defaultTheme: "rose",
  },
  finance_copilot: {
    family: "finance_copilot",
    label: "Finance Copilot",
    designLanguage: "data_finance",
    navigation: "sidebar_dashboard",
    pages: ["money_dashboard", "accounts", "analytics", "budgets", "cashflow", "forecasts", "alerts"],
    primitives: ["dashboard", "analytics_cards", "budget_widget", "cashflow_chart", "wealth_breakdown", "alerts_feed"],
    trustSignals: ["security_copy", "connected_accounts", "categorized_transactions", "forecast_confidence"],
    retentionLoop: ["alerts", "budget_progress", "weekly_summary", "monthly_review"],
    opsSurface: ["account_connections", "transaction_rules", "alert_rules", "permissions"],
    defaultTheme: "violet",
  },
  education_path: {
    family: "education_path",
    label: "Education Path",
    designLanguage: "guided_learning",
    navigation: "curriculum_path",
    pages: ["landing", "onboarding", "lesson_path", "lesson", "project", "progress", "certificate"],
    primitives: ["curriculum", "lesson_player", "progress_tracker", "certificate_block"],
    trustSignals: ["learning_outcomes", "level", "duration", "instructor_or_method", "credentials"],
    retentionLoop: ["progress_streak", "next_lesson", "milestones", "certificate_goal"],
    opsSurface: ["course_builder", "module_management", "progress_admin", "cohort_reporting"],
    defaultTheme: "emerald",
  },
  recruiting_pipeline: {
    family: "recruiting_pipeline",
    label: "Recruiting Pipeline",
    designLanguage: "talent_ops",
    navigation: "jobs_and_tracker",
    pages: ["jobs_search", "job_detail", "saved_jobs", "application_tracker", "candidate_pipeline", "hiring_analytics"],
    primitives: ["job_search", "detail_page", "job_tracker", "application_status", "candidate_queue"],
    trustSignals: ["company_profile", "role_details", "status_visibility", "network_or_referral_signals"],
    retentionLoop: ["job_alerts", "saved_jobs", "application_updates", "interview_notifications"],
    opsSurface: ["candidate_pipeline", "notes", "stage_management", "ats_sync"],
    defaultTheme: "indigo",
  },
  creator_membership: {
    family: "creator_membership",
    label: "Creator Membership",
    designLanguage: "creator_premium",
    navigation: "creator_hub",
    pages: ["creator_landing", "membership_tiers", "member_area", "community_feed", "messages"],
    primitives: ["membership_tiers", "gated_content", "community_chat", "feed"],
    trustSignals: ["tier_benefits", "creator_story", "member_count_or_social_proof", "exclusive_access_copy"],
    retentionLoop: ["new_posts", "member_chat", "tier_unlocks", "email_digest"],
    opsSurface: ["tier_management", "content_permissions", "community_moderation", "member_segments"],
    defaultTheme: "rose",
  },
  team_workspace: {
    family: "team_workspace",
    label: "Team Workspace",
    designLanguage: "collab_workspace",
    navigation: "workspace_sidebar",
    pages: ["workspace_home", "channels", "dm_threads", "projects", "workflow_board", "ai_search"],
    primitives: ["channels", "tasks", "workflow_builder", "huddles", "ai_search"],
    trustSignals: ["workspace_presence", "activity_state", "shared_docs_or_context", "permissions"],
    retentionLoop: ["notifications", "daily_active_channels", "task_updates", "ai_summaries"],
    opsSurface: ["member_management", "channel_admin", "workflow_admin", "integration_settings"],
    defaultTheme: "indigo",
  },
  support_hub: {
    family: "support_hub",
    label: "Support Hub",
    designLanguage: "support_ops",
    navigation: "inbox_first",
    pages: ["support_landing", "widget_chat", "ticket_queue", "ticket_detail", "resolution_workspace", "sla_reporting"],
    primitives: ["support_widget", "ticket_queue", "ticket_detail", "sla_panel"],
    trustSignals: ["response_time", "help_center_access", "case_history", "channel_availability"],
    retentionLoop: ["ticket_updates", "conversation_history", "self_serve_to_agent_flow"],
    opsSurface: ["agent_queue", "assignment_rules", "sla_tracking", "internal_notes", "channel_routing"],
    defaultTheme: "cyan",
  },
};

export function detectProductFamily(text: string): ProductFamily {
  const t = text.toLowerCase();
  if (includesAny(t, ["booking", "airbnb", "stay", "rental", "host", "guest", "marketplace", "listing", "reservation"])) return "marketplace_booking";
  if (includesAny(t, ["shop", "store", "ecommerce", "checkout", "cart", "catalog", "product page"])) return "commerce_storefront";
  if (includesAny(t, ["delivery", "restaurant", "food", "menu", "order tracking", "eta"])) return "delivery_local";
  if (includesAny(t, ["finance", "budget", "cash flow", "expenses", "wealth", "bank", "fintech"])) return "finance_copilot";
  if (includesAny(t, ["course", "learn", "lesson", "cohort", "student", "certificate", "academy"])) return "education_path";
  if (includesAny(t, ["recruiting", "hiring", "candidate", "job", "interview", "ats"])) return "recruiting_pipeline";
  if (includesAny(t, ["creator", "membership", "patreon", "substack", "community", "paid content"])) return "creator_membership";
  if (includesAny(t, ["workspace", "team", "slack", "collaboration", "channels", "tasks", "workflow"])) return "team_workspace";
  if (includesAny(t, ["support", "ticket", "helpdesk", "zendesk", "customer service", "sla"])) return "support_hub";
  return "commerce_storefront";
}

function includesAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

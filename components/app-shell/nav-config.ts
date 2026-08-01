export type NavItem = {
  label: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

// Mirrors the sidebar section structure from reference/chambercore-platform.html.
// Items without a real page yet are marked comingSoon and link nowhere.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "📊" }],
  },
  {
    label: "Members",
    items: [
      { label: "Member Management", href: "/members", icon: "👥" },
      { label: "Business Directory", href: "/directory", icon: "🏢" },
    ],
  },
  {
    label: "Marketplace",
    items: [{ label: "M2M Marketplace", href: "/marketplace", icon: "🤝" }],
  },
  {
    label: "Engagement",
    items: [
      { label: "Events & Registration", href: "/events", icon: "🗓️" },
      { label: "Ribbon Cuttings", href: "#", icon: "🎀", comingSoon: true },
      { label: "QR Check-In", href: "#", icon: "📱", comingSoon: true },
      { label: "Communications Hub", href: "#", icon: "📧", comingSoon: true },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Dues & Payments", href: "/dues", icon: "💳" },
      { label: "Sponsorship Management", href: "#", icon: "⭐", comingSoon: true },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Board Overview", href: "/board", icon: "🏛️" },
      { label: "Meetings & Agendas", href: "/meetings", icon: "📋" },
      { label: "Voting & Polls", href: "/voting", icon: "🗳️" },
      { label: "Document Vault", href: "/documents", icon: "📁" },
      { label: "Committees", href: "/committees", icon: "🏢" },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Analytics", href: "/analytics", icon: "📈" }],
  },
  {
    label: "Advocacy",
    items: [{ label: "Legislative Action", href: "/advocacy", icon: "⚖️" }],
  },
];

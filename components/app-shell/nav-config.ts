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
    items: [{ label: "M2M Marketplace", href: "#", icon: "🤝", comingSoon: true }],
  },
  {
    label: "Engagement",
    items: [
      { label: "Events & Registration", href: "#", icon: "🗓️", comingSoon: true },
      { label: "Ribbon Cuttings", href: "#", icon: "🎀", comingSoon: true },
      { label: "QR Check-In", href: "#", icon: "📱", comingSoon: true },
      { label: "Communications Hub", href: "#", icon: "📧", comingSoon: true },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Dues & Payments", href: "#", icon: "💳", comingSoon: true },
      { label: "Sponsorship Management", href: "#", icon: "⭐", comingSoon: true },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Board Overview", href: "#", icon: "🏛️", comingSoon: true },
      { label: "Meetings & Agendas", href: "#", icon: "📋", comingSoon: true },
      { label: "Voting & Polls", href: "#", icon: "🗳️", comingSoon: true },
      { label: "Document Vault", href: "#", icon: "📁", comingSoon: true },
      { label: "Committees", href: "#", icon: "🏢", comingSoon: true },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Analytics", href: "#", icon: "📈", comingSoon: true }],
  },
  {
    label: "Advocacy",
    items: [{ label: "Legislative Action", href: "#", icon: "⚖️", comingSoon: true }],
  },
];

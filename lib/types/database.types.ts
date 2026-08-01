// Placeholder hand-written types matching supabase/migrations/*.sql.
// Once the Supabase project is provisioned, regenerate this file with:
//   supabase gen types typescript --project-id <project-ref> > lib/types/database.types.ts
// (or the mcp__Supabase__generate_typescript_types tool) and this file can be
// replaced wholesale — the shapes below are kept in sync with the migrations
// by hand until then.

export type PlanTier = "starter" | "professional" | "enterprise";
export type OrgRole = "owner" | "admin" | "staff";
export type MemberTier = "bronze" | "silver" | "gold";
export type MemberStatus = "active" | "pending" | "lapsed" | "archived";
export type InviteRole = "admin" | "staff" | "member";
export type DuesInvoiceStatus = "pending" | "paid" | "void";
export type DuesPaymentMethod = "cash" | "check" | "card" | "ach" | "other";
export type MarketplaceKind = "deal" | "job";
export type MarketplaceStatus = "pending" | "approved" | "archived";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type DocumentCategory = "governing" | "minutes" | "financial" | "policies" | "other";
export type MeetingFormat = "in_person" | "virtual" | "hybrid";
export type CommitteeType = "executive" | "finance" | "committee";
export type VoteStatus = "open" | "closed";
export type IssueStatus = "urgent" | "watch" | "monitoring" | "resolved";
export type OfficialLevel = "federal" | "state" | "local";

type Relationships = never[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Relationships: Relationships;
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          plan_tier: PlanTier;
          member_limit: number | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string;
          plan_tier?: PlanTier;
          member_limit?: number | null;
          stripe_customer_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      org_members: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
        };
        Update: Partial<Database["public"]["Tables"]["org_members"]["Insert"]>;
      };
      members: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          business_name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          category: string | null;
          tier: MemberTier;
          status: MemberStatus;
          member_since: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          business_name: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          category?: string | null;
          tier?: MemberTier;
          status?: MemberStatus;
          member_since?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
      };
      directory_listings: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          member_id: string;
          is_public: boolean;
          description: string | null;
          website_url: string | null;
          address: string | null;
          logo_url: string | null;
          featured: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          member_id: string;
          is_public?: boolean;
          description?: string | null;
          website_url?: string | null;
          address?: string | null;
          logo_url?: string | null;
          featured?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["directory_listings"]["Insert"]>;
      };
      subscriptions: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan_tier: PlanTier;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan_tier: PlanTier;
          status: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      org_invites: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: InviteRole;
          token: string;
          member_id: string | null;
          invited_by: string | null;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role: InviteRole;
          member_id?: string | null;
          invited_by?: string | null;
          accepted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["org_invites"]["Insert"]>;
      };
      dues_tier_pricing: {
        Relationships: Relationships;
        Row: {
          org_id: string;
          tier: MemberTier;
          annual_price: number | null;
          updated_at: string;
        };
        Insert: {
          org_id: string;
          tier: MemberTier;
          annual_price?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["dues_tier_pricing"]["Insert"]>;
      };
      dues_invoices: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          member_id: string;
          description: string;
          amount: number;
          due_date: string;
          status: DuesInvoiceStatus;
          payment_method: DuesPaymentMethod | null;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          member_id: string;
          description: string;
          amount: number;
          due_date: string;
          status?: DuesInvoiceStatus;
          payment_method?: DuesPaymentMethod | null;
          paid_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["dues_invoices"]["Insert"]>;
      };
      events: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          location: string | null;
          starts_at: string;
          price: number | null;
          capacity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          starts_at: string;
          price?: number | null;
          capacity?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      event_registrations: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          member_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Insert"]>;
      };
      marketplace_listings: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          member_id: string;
          kind: MarketplaceKind;
          title: string;
          category: string | null;
          description: string | null;
          status: MarketplaceStatus;
          discount_label: string | null;
          promo_code: string | null;
          expires_at: string | null;
          employment_type: EmploymentType | null;
          location: string | null;
          pay_range: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          member_id: string;
          kind: MarketplaceKind;
          title: string;
          category?: string | null;
          description?: string | null;
          status?: MarketplaceStatus;
          discount_label?: string | null;
          promo_code?: string | null;
          expires_at?: string | null;
          employment_type?: EmploymentType | null;
          location?: string | null;
          pay_range?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["marketplace_listings"]["Insert"]>;
      };
      documents: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          title: string;
          category: DocumentCategory;
          file_path: string;
          file_name: string;
          file_size: number | null;
          content_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          category?: DocumentCategory;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          content_type?: string | null;
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      meetings: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          title: string;
          meeting_type: string | null;
          format: MeetingFormat;
          location: string | null;
          starts_at: string;
          duration_minutes: number;
          agenda: string | null;
          minutes_document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          meeting_type?: string | null;
          format?: MeetingFormat;
          location?: string | null;
          starts_at: string;
          duration_minutes?: number;
          agenda?: string | null;
          minutes_document_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["meetings"]["Insert"]>;
      };
      meeting_rsvps: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          meeting_id: string;
          member_id: string;
          responded_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          meeting_id: string;
          member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["meeting_rsvps"]["Insert"]>;
      };
      board_members: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          member_id: string | null;
          name: string;
          title: string | null;
          is_executive: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          member_id?: string | null;
          name: string;
          title?: string | null;
          is_executive?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["board_members"]["Insert"]>;
      };
      committees: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          committee_type: CommitteeType;
          chair_board_member_id: string | null;
          next_meeting_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          committee_type?: CommitteeType;
          chair_board_member_id?: string | null;
          next_meeting_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["committees"]["Insert"]>;
      };
      committee_memberships: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          committee_id: string;
          board_member_id: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          committee_id: string;
          board_member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["committee_memberships"]["Insert"]>;
      };
      votes: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: VoteStatus;
          closes_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description?: string | null;
          status?: VoteStatus;
          closes_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>;
      };
      vote_options: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          vote_id: string;
          label: string;
          position: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          vote_id: string;
          label: string;
          position?: number;
        };
        Update: Partial<Database["public"]["Tables"]["vote_options"]["Insert"]>;
      };
      vote_casts: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          vote_id: string;
          option_id: string;
          board_member_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          vote_id: string;
          option_id: string;
          board_member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["vote_casts"]["Insert"]>;
      };
      advocacy_issues: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: IssueStatus;
          position: string | null;
          cta_headline: string | null;
          cta_email_subject: string | null;
          cta_email_body: string | null;
          goal_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description?: string | null;
          status?: IssueStatus;
          position?: string | null;
          cta_headline?: string | null;
          cta_email_subject?: string | null;
          cta_email_body?: string | null;
          goal_count?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["advocacy_issues"]["Insert"]>;
      };
      advocacy_action_log: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          issue_id: string;
          member_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          issue_id: string;
          member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["advocacy_action_log"]["Insert"]>;
      };
      officials: {
        Relationships: Relationships;
        Row: {
          id: string;
          org_id: string;
          name: string;
          title: string | null;
          level: OfficialLevel;
          email: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          title?: string | null;
          level?: OfficialLevel;
          email?: string | null;
          phone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["officials"]["Insert"]>;
      };
    };
    Views: {
      public_org_profile: {
        Relationships: Relationships;
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
        };
      };
    };
    Functions: Record<string, never>;
  };
}

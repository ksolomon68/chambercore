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
          invited_by?: string | null;
          accepted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["org_invites"]["Insert"]>;
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

// Type definitions for Deno runtime in Edge Functions
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }
  const env: Env;
}

declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/stripe@14.21.0" {
  export default class Stripe {
    constructor(key: string, options?: any);
    customers: {
      list(params: any): Promise<{ data: any[] }>;
    };
    subscriptions: {
      list(params: any): Promise<{ data: any[] }>;
    };
    checkout: {
      sessions: {
        create(params: any): Promise<{ id: string; url: string }>;
      };
    };
    billingPortal: {
      sessions: {
        create(params: any): Promise<{ id: string; url: string }>;
      };
    };
    prices: {
      retrieve(id: string): Promise<{ id: string; unit_amount: number | null }>;
    };
  }
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export function createClient(url: string, key: string, options?: any): any;
}
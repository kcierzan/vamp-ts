// See https://kit.svelte.dev/docs/types#app
import type { Session, SupabaseClient } from "@supabase/supabase-js";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession(): Promise<Session | null>;
      session: Session | null;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
  declare type Item = import("svelte-dnd-action").Item;
  declare type DndEvent<ItemType = Item> = import("svelte-dnd-action").DndEvent<ItemType>;
  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      "on:consider"?: (
        event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }
      ) => void;
      "on:finalize"?: (
        event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }
      ) => void;
    }
  }
}

export {};

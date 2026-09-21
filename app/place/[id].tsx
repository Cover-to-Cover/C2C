// app/place/[id].tsx
//
// Landing page for place links shared from the app:
//   /place/<id>?kind=restaurant|mosque|grocery&name=...&address=...
//
// Google-sourced places (ids starting "g:") aren't in our database, so the
// name/address query params carry enough to render a preview for those.
import { SharePage, type SharePreview } from "@/components/share/SharePage";
import { getSupabase, NOT_CONFIGURED } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

type Kind = "restaurant" | "mosque" | "grocery";

const TABLE: Record<Kind, string> = {
  restaurant: "halal_restaurants",
  mosque: "mosques",
  grocery: "halal_groceries",
};

const LABEL: Record<Kind, string> = {
  restaurant: "Halal Restaurant",
  mosque: "Mosque",
  grocery: "Halal Store",
};

function isKind(v: unknown): v is Kind {
  return v === "restaurant" || v === "mosque" || v === "grocery";
}

export default function PlaceShare() {
  const params = useLocalSearchParams<{
    id: string;
    kind?: string;
    name?: string;
    address?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SharePreview | null>(null);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    const kind: Kind = isKind(params.kind) ? params.kind : "restaurant";

    const appQuery = new URLSearchParams();
    appQuery.set("kind", kind);
    if (params.name) appQuery.set("name", params.name);
    if (params.address) appQuery.set("address", params.address);
    const appPath = `place/${encodeURIComponent(id)}?${appQuery.toString()}`;

    const fallback = (): SharePreview | null =>
      params.name
        ? {
            kicker: LABEL[kind],
            title: params.name,
            lines: [params.address].filter(Boolean) as string[],
            appPath,
            mapsQuery: params.address ? `${params.name}, ${params.address}` : params.name,
          }
        : null;

    (async () => {
      if (id.startsWith("g:")) {
        setPreview(fallback());
        if (!params.name) setError("This place isn't available.");
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        // Still show what the link carried; Google-only places rely on it anyway.
        const fb = fallback();
        setPreview(fb);
        if (!fb) setError(NOT_CONFIGURED);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from(TABLE[kind])
        .select("id,name,address,city,state,latitude,longitude")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const fb = fallback();
        setPreview(fb);
        if (!fb) setError(error?.message ?? "This place isn't available.");
      } else {
        const where = [data.address, data.city, data.state].filter(Boolean).join(", ");
        setPreview({
          kicker: LABEL[kind],
          title: data.name,
          lines: [where].filter(Boolean),
          appPath,
          mapsQuery:
            data.latitude != null && data.longitude != null
              ? `${data.latitude},${data.longitude}`
              : `${data.name}, ${where}`,
        });
      }
      setLoading(false);
    })();
  }, [params.id, params.kind, params.name, params.address]);

  return <SharePage loading={loading} error={error} preview={preview} />;
}

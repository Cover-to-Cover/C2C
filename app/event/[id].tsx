// app/event/[id].tsx
//
// Landing page for event links shared from the app: /event/<id>
import { SharePage, type SharePreview } from "@/components/share/SharePage";
import { getSupabase, NOT_CONFIGURED } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

function formatWhen(startIso: string, endIso?: string | null) {
  const start = new Date(startIso);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const startText = start.toLocaleString(undefined, opts);
  if (!endIso) return startText;
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  const endText = sameDay
    ? end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : end.toLocaleString(undefined, opts);
  return `${startText} – ${endText}`;
}

export default function EventShare() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SharePreview | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setError(NOT_CONFIGURED);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("events")
        .select("id,title,description,start_time,end_time,address,city,state,latitude,longitude,image_url")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (!data) {
        setError("This event isn't available.");
      } else {
        const where = [data.address, data.city, data.state].filter(Boolean).join(", ");
        setPreview({
          kicker: "Community Event",
          title: data.title,
          lines: [formatWhen(data.start_time, data.end_time), where].filter(Boolean),
          description: data.description,
          imageUrl: data.image_url,
          appPath: `event/${data.id}`,
          mapsQuery:
            data.latitude != null && data.longitude != null
              ? `${data.latitude},${data.longitude}`
              : where || null,
        });
      }
      setLoading(false);
    })();
  }, [id]);

  return <SharePage loading={loading} error={error} preview={preview} />;
}

"use client";
import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
export function Timezone() {
  const [zone, setZone] = useState("");
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  return (
    <p className="timezone">
      <Globe2 size={14} />
      {zone
        ? `Your timezone: ${zone.replaceAll("_", " ")}`
        : "Times are shown by the booking provider."}
    </p>
  );
}

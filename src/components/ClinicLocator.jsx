import { useState } from "react";
import Section from "./Section.jsx";
import Button from "./Button.jsx";

const FALLBACK_URL = "https://www.google.com/maps/search/hospitals+clinics+near+me";
const GEOLOCATION_TIMEOUT_MS = 10000;

export default function ClinicLocator() {
  const [status, setStatus] = useState("");
  const [locating, setLocating] = useState(false);

  function openMaps(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleFind() {
    setLocating(true);
    setStatus("Finding your location… لوکیشن تلاش کی جا رہی ہے");

    if (!navigator.geolocation) {
      openMaps(FALLBACK_URL);
      setStatus("Location not supported — opened a general search instead. لوکیشن دستیاب نہیں");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        openMaps(`https://www.google.com/maps/search/hospitals+clinics/@${latitude},${longitude},15z`);
        setStatus("Opening nearby clinics on Google Maps… نقشہ کھولا جا رہا ہے");
        setLocating(false);
      },
      () => {
        openMaps(FALLBACK_URL);
        setStatus("Couldn't access location — opened a general search instead. لوکیشن حاصل نہیں ہو سکی");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60000 }
    );
  }

  return (
    <Section
      index="02"
      eyebrow="Get There"
      title="Nearby Clinic Locator"
      urduTitle="قریبی طبی مرکز"
      subtitle="One tap opens Google Maps with hospitals and clinics near your current location."
      urduSubtitle="ایک ٹیپ میں آپ کے قریب ہسپتال اور کلینک نقشے پر کھل جائیں گے"
    >
      <Button type="button" onClick={handleFind} disabled={locating} className="w-full md:w-auto">
        <span aria-hidden="true">🏥</span>
        <span>Find Nearby Clinics</span>
        <span className="urdu">قریبی کلینک تلاش کریں</span>
      </Button>

      {status && <p className="mt-3 text-sm text-ink-soft" aria-live="polite">{status}</p>}
    </Section>
  );
}

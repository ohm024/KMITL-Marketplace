"use client";

import { useState } from "react";

const pickupLocations = [
  { id: 1, name: "ตึกพระเทพฯ (HM)", lat: 13.729888, lng: 100.778211, detail: "หน้าตึก HM ใกล้ร้านกาแฟ" },
  { id: 2, name: "โรงอาหาร C1", lat: 13.728512, lng: 100.776512, detail: "โต๊ะม้านั่งยาวหน้าโรงอาหาร" },
  { id: 3, name: "หอประชุมใหญ่ สจล.", lat: 13.727100, lng: 100.774200, detail: "ลานกิจกรรมหน้าหอประชุม" },
  { id: 4, name: "คณะสถาปัตย์", lat: 13.726500, lng: 100.778000, detail: "ลานใต้ตึกคณะสถาปัตย์" },
];

export default function CampusMap() {
  const [selectedLoc, setSelectedLoc] = useState(pickupLocations[0]);

  return (
    <div className="my-4 space-y-3">
      {/* Map Display */}
      <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative bg-gray-100">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLoc.lng - 0.004}%2C${selectedLoc.lat - 0.002}%2C${selectedLoc.lng + 0.004}%2C${selectedLoc.lat + 0.002}&layer=mapnik&marker=${selectedLoc.lat}%2C${selectedLoc.lng}`}
        />
      </div>

      {/* Pickup Location Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {pickupLocations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => setSelectedLoc(loc)}
            className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-all ${
              selectedLoc.id === loc.id
                ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm font-bold"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div>📍 {loc.name}</div>
            <div className="text-[10px] text-gray-500 truncate mt-0.5 font-normal">{loc.detail}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
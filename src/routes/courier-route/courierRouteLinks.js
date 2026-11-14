export function navigationAddress(stop) {
  return [stop?.address, stop?.complement]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ');
}

export function googleMapsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

export function wazeUrl(address) {
  return `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

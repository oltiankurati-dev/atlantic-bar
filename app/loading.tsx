export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-1 min-h-[70vh] items-center justify-center">
      <span className="h-10 w-10 rounded-full border-2 border-gold/25 border-t-gold animate-spin motion-reduce:animate-none" />
      <span className="sr-only">Lädt…</span>
    </div>
  );
}

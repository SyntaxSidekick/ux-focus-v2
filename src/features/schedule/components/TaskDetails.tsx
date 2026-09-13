export function TaskDetails({ id, details }: { id: string; details: string }) {
  return (
    <div id={id} className="px-4 pb-2.5 pl-10 text-[11px] leading-relaxed text-muted-foreground/80 whitespace-pre-wrap break-words">
      {details}
    </div>
  );
}

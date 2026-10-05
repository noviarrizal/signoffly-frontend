/** Section headline with one italic word of the same font (design guide, section 3). The italic word is optional. */
export function SectionTitle({ before, emphasis, after, as: Tag = "h2", className = "" }: { before: string; emphasis?: string; after?: string; as?: "h1" | "h2"; className?: string }) {
  return (
    <Tag className={`text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em] ${className}`}>
      {before}
      {emphasis ? (
        <>
          {" "}
          <em className="inline-block pb-[.06em] font-normal italic">{emphasis}</em>
        </>
      ) : null}
      {after ? ` ${after}` : ""}
    </Tag>
  );
}
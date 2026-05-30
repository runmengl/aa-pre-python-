export default function Card({
  title,
  eyebrow,
  action,
  children,
  className = "",
  bodyClassName = "",
  as: Component = "section",
}) {
  return (
    <Component className={`card ${className}`.trim()}>
      {(eyebrow || title || action) && (
        <div className="cardHeader">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="cardTitle">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className={`cardBody ${bodyClassName}`.trim()}>{children}</div>
    </Component>
  );
}

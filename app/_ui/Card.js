function CardHeader({ children }) {
  return (
    <div className="grid items-center justify-center pt-2 text-lg">
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}

function Card({ children }) {
  return (
    <div className="border-primary-300 bg-primary-50 w-full rounded-xl border shadow-xs">
      {children}
    </div>
  );
}

Card.CardHeader = CardHeader;
Card.CardContent = CardContent;

export default Card;

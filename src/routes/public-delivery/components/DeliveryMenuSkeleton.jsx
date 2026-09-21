export default function DeliveryMenuSkeleton() {
  return (
    <div className="delivery-page delivery-skeleton-page" aria-busy="true" aria-label="Carregando cardápio">
      <div className="delivery-skel-hero" />
      <div className="delivery-skel-body">
        <div className="delivery-skel-search" />
        <div className="delivery-skel-cats">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`cat-${index}`} className="delivery-skel-cat" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`card-${index}`} className="delivery-skel-card" />
        ))}
      </div>
    </div>
  );
}

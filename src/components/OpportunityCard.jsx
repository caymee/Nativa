export default function OpportunityCard({ opportunity }) {
  return (
    <div className="opportunity-card">
      <span className="opportunity-category">
        {opportunity.category}
      </span>

      <h3>{opportunity.title}</h3>

      <p>{opportunity.description}</p>

      <div className="opportunity-info">
        <span>{opportunity.organization}</span>
        <span>{opportunity.location}</span>
      </div>

      <a href={opportunity.link} className="opportunity-link">
        Saiba mais →
      </a>
    </div>
  );
}
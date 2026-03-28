import ArticleLayout from "@/components/blog/ArticleLayout";

export default function PortugalVsSpain() {
  return (
    <ArticleLayout
      category="Compare"
      categoryPath="/blog"
      title="Portugal vs Spain"
      subtitle="Side-by-side comparison of visas, cost of living, taxes, and quality of life."
    >
      <h2>Overview</h2>
      <p>
        Both Portugal and Spain attract thousands of relocators every year, but
        they differ significantly in visa accessibility, tax regimes, and
        lifestyle.
      </p>

      <h2>Visa Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Portugal</th>
            <th>Spain</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Digital Nomad Visa</td>
            <td>Yes</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Min. Income Requirement</td>
            <td>~€3,040/mo</td>
            <td>~€2,520/mo</td>
          </tr>
          <tr>
            <td>Processing Time</td>
            <td>2–4 months</td>
            <td>1–3 months</td>
          </tr>
        </tbody>
      </table>

      <h2>Cost of Living</h2>
      <p>Content coming soon.</p>

      <h2>Tax Regimes</h2>
      <p>Content coming soon.</p>

      <h2>Quality of Life</h2>
      <p>Content coming soon.</p>

      <h2>Verdict</h2>
      <p>Content coming soon.</p>
    </ArticleLayout>
  );
}

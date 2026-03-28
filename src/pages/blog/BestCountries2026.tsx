import ArticleLayout from "@/components/blog/ArticleLayout";

export default function BestCountries2026() {
  return (
    <ArticleLayout
      category="Best of"
      categoryPath="/blog"
      title="Best Countries to Move to in 2026"
      subtitle="Our ranked list of the easiest and most rewarding countries for relocation this year."
    >
      <h2>How We Ranked</h2>
      <p>
        We scored each country across visa accessibility, cost of living,
        safety, internet infrastructure, tax friendliness, and path to
        permanent residency.
      </p>

      <h2>Top 10</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Country</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Portugal</td><td>95</td></tr>
          <tr><td>2</td><td>Spain</td><td>93</td></tr>
          <tr><td>3</td><td>Georgia</td><td>91</td></tr>
          <tr><td>4</td><td>Montenegro</td><td>89</td></tr>
          <tr><td>5</td><td>Thailand</td><td>87</td></tr>
        </tbody>
      </table>

      <h2>Detailed Breakdown</h2>
      <p>Content coming soon.</p>

      <h2>Methodology</h2>
      <p>Content coming soon.</p>
    </ArticleLayout>
  );
}

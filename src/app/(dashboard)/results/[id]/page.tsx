import { ResultsView } from "@/components/results/results-view";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ResultsView queryId={id} />;
}

import { ResultsView } from "@/components/results/results-view";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ResultsView queryId={id} />
      </div>
    </div>
  );
}

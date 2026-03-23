import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  summary: string | null;
  fullResponse: string;
};

export function ResponsePanels({ summary, fullResponse }: Props) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="full">Full response</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="mt-4">
        <ScrollArea className="h-[min(320px,40vh)] rounded-xl border border-border/80 bg-muted/20 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {summary ?? "No summary available."}
          </p>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="full" className="mt-4">
        <ScrollArea className="h-[min(420px,50vh)] rounded-xl border border-border/80 bg-muted/20 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {fullResponse}
          </pre>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();

  return (
    

      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm">
            <span className="animate-pulse">Coming Soon</span>
          </div>
        </div>
      </div>
    
  );
}

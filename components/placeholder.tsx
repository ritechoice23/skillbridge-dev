import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Placeholder({
  title,
  description,
  planned,
}: {
  title: string;
  description: string;
  planned?: string[];
}) {
  return (
    <section className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{title}</CardTitle>
            <Badge variant="outline">Under construction</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground">{description}</p>
          {planned && planned.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {planned.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">·</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <LinkButton variant="outline" href="/">
            Back home
          </LinkButton>
        </CardFooter>
      </Card>
    </section>
  );
}

import Link from "next/link";
import { ArrowRightIcon, SearchIcon, SendIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    icon: SearchIcon,
    title: "Discover",
    description:
      "Browse a directory of mentors and filter by the skill you want to learn.",
  },
  {
    icon: SendIcon,
    title: "Request",
    description:
      "Send a mentorship request with a short message about your goals.",
  },
  {
    icon: SparklesIcon,
    title: "Learn",
    description:
      "Once a mentor accepts, start learning from someone who has done it.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <Badge variant="secondary">Practical skills, real mentors</Badge>
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Learn a skill from someone who has already done it
          </h1>
          <p className="text-lg text-muted-foreground">
            SkillBridge connects you with mentors for practical skills — send a
            request, get accepted, and grow.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" render={<Link href="/mentors" />}>
            Find a mentor
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/auth/signup" />}
          >
            Become a mentor
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground">
              Three steps between you and a mentor.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <step.icon className="size-5 text-primary" />
                    <Badge variant="ghost">Step {index + 1}</Badge>
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Ready when you are.
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

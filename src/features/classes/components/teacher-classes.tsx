import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { ClassSubjectOption } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Read-only view of a teacher's assigned class-subject offerings. */
export function TeacherClasses({ offerings }: { offerings: ClassSubjectOption[] }) {
  if (offerings.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
        <BookOpen className="size-8 opacity-40" />
        <p className="text-sm">You have no assigned classes yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {offerings.map((o) => (
        <Card key={o.id} className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{o.className}</h3>
              <p className="text-xs text-muted-foreground">Grade {o.gradeLevel}</p>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {o.subjectName}
            </span>
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <Button asChild variant="link" className="h-auto p-0 text-primary">
              <Link href={`/dashboard/attendance?cs=${o.id}`}>
                Take attendance <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

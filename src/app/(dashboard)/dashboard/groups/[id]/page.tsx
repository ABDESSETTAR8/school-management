import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, MessageCircle } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getGroupDetail } from "@/features/groups/queries";
import { whatsappLink } from "@/lib/notify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Group" };

const DZD = (n: number) => `${n.toLocaleString()} DZD`;

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("groups");
  const { id } = await params;
  const data = await getGroupDetail(id);
  if (!data) notFound();
  const { group, students } = data;

  const revenue = students.length * group.monthlyFee;
  const paidCount = students.filter((s) => s.paidStatus === "paid").length;

  const stats = [
    { label: "Students", value: students.length },
    { label: "Monthly revenue", value: DZD(revenue) },
    { label: "Paid this month", value: `${paidCount}/${students.length}` },
    { label: "Fee / student", value: DZD(group.monthlyFee) },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/groups"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to groups
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
            <Badge variant={group.isActive ? "success" : "secondary"}>
              {group.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {[group.className, group.teacherName, group.schedule, group.classroom]
              .filter(Boolean)
              .join(" · ") || "No details set"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/attendance?grp=${group.id}`}>
            <CalendarCheck className="size-4" /> Take attendance
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Attendance (month)</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead className="text-right">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      No students in this group yet. Assign a group on the Students page.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.phone ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium">{s.attendanceRate}%</span>{" "}
                      <span className="text-muted-foreground">
                        ({s.presentCount} present · {s.absentCount} absent)
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.paidStatus === "paid" ? (
                        <Badge variant="success">Paid</Badge>
                      ) : s.paidStatus === "partial" ? (
                        <Badge variant="warning">Partial</Badge>
                      ) : (
                        <Badge variant="destructive">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.phone ? (
                        <a
                          href={whatsappLink(s.phone, `Hello, regarding ${s.name} at our school.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#25D366] hover:underline"
                        >
                          <MessageCircle className="size-4" /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

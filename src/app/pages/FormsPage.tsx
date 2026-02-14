import { Link } from "react-router";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { DollarSign, Receipt, Megaphone, ListChecks, FileText } from "lucide-react";

export function FormsPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-px bg-black" />
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400">Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-black mb-1">Forms & Requests</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Submit budgets, reimbursements, social media requests, and committee reports for review.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-0 shadow-lg ring-1 ring-black/5 md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="size-5" />
                My Submissions
              </CardTitle>
              <CardDescription>
                Check status updates and review notes on your submitted requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full sm:w-auto border-black text-black hover:bg-black hover:text-white">
                <Link to="/forms/my">View My Submissions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="size-5" />
                Budget Submission
              </CardTitle>
              <CardDescription>
                Committee chairs (and members, if applicable) submit proposed budgets for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-black hover:bg-gray-900 w-full">
                <Link to="/forms/budget">Open Form</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="size-5" />
                Reimbursement Request
              </CardTitle>
              <CardDescription>
                Submit out-of-pocket expenses for review and repayment tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-black hover:bg-gray-900 w-full">
                <Link to="/forms/reimbursement">Open Form</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone className="size-5" />
                Social Media Request
              </CardTitle>
              <CardDescription>
                Request flyers, announcements, and board-ready messaging for distribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-black hover:bg-gray-900 w-full">
                <Link to="/forms/social-media">Open Form</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="size-5" />
                Committee Report
              </CardTitle>
              <CardDescription>
                Submit committee updates and attachments for recordkeeping and review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-black hover:bg-gray-900 w-full">
                <Link to="/forms/committee-report">Open Form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

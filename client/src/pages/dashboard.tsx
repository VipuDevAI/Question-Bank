import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { PageLayout, PageHeader, PageContent, ContentCard, GridContainer, PageFooter } from "@/components/page-layout";
import { CoinButton } from "@/components/coin-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload, FileText, Unlock, Eye, Calendar, ClipboardList,
  BookOpen, Clock, BarChart3, Users, Building2, Settings, LogOut, ChevronDown,
  PlayCircle, CheckCircle, Award, TrendingUp, Bell
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleConfig: Record<string, { label: string; color: string }> = {
    teacher: { label: "Teacher", color: "bg-coin-green text-white" },
    student: { label: "Student", color: "bg-coin-blue text-white" },
    parent: { label: "Parent", color: "bg-coin-purple text-white" },
    admin: { label: "Admin", color: "bg-primary text-primary-foreground" },
    super_admin: { label: "Super Admin", color: "bg-coin-gold text-white" },
  };

  const config = roleConfig[user.role] || roleConfig.student;

  return (
    <PageLayout>
      <PageHeader>
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Question Bank" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold">Question Bank</h1>
              <p className="text-sm text-muted-foreground">Assessment Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge className={config.color} size="sm">{config.label}</Badge>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")} data-testid="menu-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Here's what's happening today</p>
        </div>

        {user.role === "teacher" && <TeacherDashboard />}
        {user.role === "student" && <StudentDashboard />}
        {user.role === "parent" && <ParentDashboard />}
        {(user.role === "admin" || user.role === "super_admin") && <AdminDashboard />}
      </PageContent>
      <PageFooter />
    </PageLayout>
  );
}

function TeacherDashboard() {
  const [, navigate] = useLocation();

  return (
    <GridContainer cols={3}>
      <ContentCard
        title="Question Bank"
        description="Upload and manage questions"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="gold"
            className="w-full"
            icon={<Upload className="w-5 h-5" />}
            onClick={() => navigate("/questions/upload")}
            data-testid="button-upload-questions"
          >
            Upload Questions
          </CoinButton>
          <CoinButton
            color="blue"
            className="w-full"
            icon={<FileText className="w-5 h-5" />}
            onClick={() => navigate("/questions")}
            data-testid="button-view-questions"
          >
            View Questions
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Tests & Exams"
        description="Create and manage tests"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="blue"
            className="w-full"
            icon={<ClipboardList className="w-5 h-5" />}
            onClick={() => navigate("/tests/create")}
            data-testid="button-create-paper"
          >
            Create Paper
          </CoinButton>
          <CoinButton
            color="green"
            className="w-full"
            icon={<Unlock className="w-5 h-5" />}
            onClick={() => navigate("/chapters")}
            data-testid="button-unlock-chapter"
          >
            Unlock Chapter
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Results & Reports"
        description="View scores and analytics"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="orange"
            className="w-full"
            icon={<Eye className="w-5 h-5" />}
            onClick={() => navigate("/tests/reveal")}
            data-testid="button-reveal-scores"
          >
            Reveal Scores
          </CoinButton>
          <CoinButton
            color="indigo"
            className="w-full"
            icon={<BarChart3 className="w-5 h-5" />}
            onClick={() => navigate("/reports")}
            data-testid="button-view-reports"
          >
            View Reports
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Syllabus Planning"
        description="Manage test portions"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="teal"
            className="w-full"
            icon={<Calendar className="w-5 h-5" />}
            onClick={() => navigate("/portions")}
            data-testid="button-portion-planner"
          >
            Portion Planner
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Make-up Tests"
        description="For absent students"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="pink"
            className="w-full"
            icon={<Clock className="w-5 h-5" />}
            onClick={() => navigate("/tests/makeup")}
            data-testid="button-makeup-test"
          >
            Create Make-up
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Manual Marking"
        description="Grade descriptive answers"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="green"
            className="w-full"
            icon={<CheckCircle className="w-5 h-5" />}
            onClick={() => navigate("/marking")}
            data-testid="button-manual-marking"
          >
            Start Marking
          </CoinButton>
        </div>
      </ContentCard>
    </GridContainer>
  );
}

function StudentDashboard() {
  const [, navigate] = useLocation();

  return (
    <GridContainer cols={3}>
      <ContentCard
        title="Practice Zone"
        description="Practice questions at your pace"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="green"
            className="w-full"
            icon={<PlayCircle className="w-5 h-5" />}
            onClick={() => navigate("/practice")}
            data-testid="button-start-practice"
          >
            Start Practice
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Mock Exams"
        description="Timed exam simulations"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="orange"
            className="w-full"
            icon={<Clock className="w-5 h-5" />}
            onClick={() => navigate("/mock")}
            data-testid="button-take-mock"
          >
            Take Mock Exam
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="My Results"
        description="View your performance"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="indigo"
            className="w-full"
            icon={<Award className="w-5 h-5" />}
            onClick={() => navigate("/results")}
            data-testid="button-view-results"
          >
            View Results
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Study Materials"
        description="Chapter-wise content"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="blue"
            className="w-full"
            icon={<BookOpen className="w-5 h-5" />}
            onClick={() => navigate("/study")}
            data-testid="button-study-materials"
          >
            Browse Chapters
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Progress Tracker"
        description="Track your learning journey"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="teal"
            className="w-full"
            icon={<TrendingUp className="w-5 h-5" />}
            onClick={() => navigate("/progress")}
            data-testid="button-progress"
          >
            View Progress
          </CoinButton>
        </div>
      </ContentCard>
    </GridContainer>
  );
}

function ParentDashboard() {
  const [, navigate] = useLocation();

  return (
    <GridContainer cols={3}>
      <ContentCard
        title="Child's Performance"
        description="View academic progress"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="purple"
            className="w-full"
            icon={<BarChart3 className="w-5 h-5" />}
            onClick={() => navigate("/child/performance")}
            data-testid="button-child-performance"
          >
            View Performance
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Test Reports"
        description="Download score reports"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="blue"
            className="w-full"
            icon={<FileText className="w-5 h-5" />}
            onClick={() => navigate("/child/reports")}
            data-testid="button-child-reports"
          >
            Download Reports
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Attendance"
        description="Track test attendance"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="green"
            className="w-full"
            icon={<CheckCircle className="w-5 h-5" />}
            onClick={() => navigate("/child/attendance")}
            data-testid="button-child-attendance"
          >
            View Attendance
          </CoinButton>
        </div>
      </ContentCard>
    </GridContainer>
  );
}

function AdminDashboard() {
  const [, navigate] = useLocation();

  return (
    <GridContainer cols={3}>
      <ContentCard
        title="Tenant Management"
        description="Manage schools and tenants"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="green"
            className="w-full"
            icon={<Building2 className="w-5 h-5" />}
            onClick={() => navigate("/admin/tenants")}
            data-testid="button-add-school"
          >
            Add School
          </CoinButton>
          <CoinButton
            color="blue"
            className="w-full"
            icon={<Eye className="w-5 h-5" />}
            onClick={() => navigate("/admin/tenants")}
            data-testid="button-view-schools"
          >
            View Schools
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="User Management"
        description="Manage all users"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="indigo"
            className="w-full"
            icon={<Users className="w-5 h-5" />}
            onClick={() => navigate("/admin/users")}
            data-testid="button-manage-users"
          >
            Manage Users
          </CoinButton>
        </div>
      </ContentCard>

      <ContentCard
        title="Platform Reports"
        description="Analytics across schools"
      >
        <div className="space-y-3 mt-4">
          <CoinButton
            color="teal"
            className="w-full"
            icon={<BarChart3 className="w-5 h-5" />}
            onClick={() => navigate("/admin/analytics")}
            data-testid="button-platform-analytics"
          >
            View Analytics
          </CoinButton>
        </div>
      </ContentCard>
    </GridContainer>
  );
}

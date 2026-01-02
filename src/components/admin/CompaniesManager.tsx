import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Building2,
  Trash2,
  UserPlus,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Globe,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  industry: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserCompany = {
  id: string;
  user_id: number;
  company_id: string;
  role: string | null;
  is_primary: boolean;
  joined_at: string;
  user?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  };
};

type BotUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  tg_user_id: number;
};

const INDUSTRIES = [
  "IT",
  "Marketing",
  "Finance",
  "Education",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media",
  "Other",
];

export function CompaniesManager() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLinkUserOpen, setIsLinkUserOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Company[];
    },
  });

  // Fetch users for linking
  const { data: users } = useQuery({
    queryKey: ["bot_users_for_companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_users")
        .select("id, first_name, last_name, username, tg_user_id")
        .order("first_name", { ascending: true });
      if (error) throw error;
      return data as BotUser[];
    },
  });

  // Fetch company employees
  const { data: companyEmployees } = useQuery({
    queryKey: ["user_companies", viewingCompany?.id],
    queryFn: async () => {
      if (!viewingCompany) return [];
      const { data, error } = await supabase
        .from("user_companies")
        .select(`
          *,
          user:bot_users(id, first_name, last_name, username)
        `)
        .eq("company_id", viewingCompany.id)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return data as UserCompany[];
    },
    enabled: !!viewingCompany,
  });

  // Create company mutation
  const createCompany = useMutation({
    mutationFn: async (company: Partial<Company>) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsCreateOpen(false);
      toast({ title: "Компания создана" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Company> & { id: string }) => {
      const { error } = await supabase
        .from("companies")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsEditOpen(false);
      setSelectedCompany(null);
      toast({ title: "Компания обновлена" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Toggle verify mutation
  const toggleVerify = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase
        .from("companies")
        .update({ is_verified })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Статус изменён" });
    },
  });

  // Link user to company mutation
  const linkUser = useMutation({
    mutationFn: async ({
      userId,
      companyId,
      role,
    }: {
      userId: number;
      companyId: string;
      role: string;
    }) => {
      const { data, error } = await supabase
        .from("user_companies")
        .insert({
          user_id: userId,
          company_id: companyId,
          role,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_companies"] });
      setIsLinkUserOpen(false);
      setSelectedCompany(null);
      toast({ title: "Пользователь добавлен" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Delete company mutation
  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Компания удалена" });
    },
  });

  // Remove user from company mutation
  const removeUserFromCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_companies"] });
      toast({ title: "Пользователь удалён из компании" });
    },
  });

  const filteredCompanies = companies?.filter((company) => {
    const searchLower = search.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      company.industry?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Управление компаниями
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{companies?.length || 0} компаний</Badge>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить компанию
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Новая компания</DialogTitle>
              </DialogHeader>
              <CompanyForm onSubmit={(data) => createCompany.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по названию или индустрии..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Компания</TableHead>
              <TableHead>Индустрия</TableHead>
              <TableHead>Сайт</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies?.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {company.name}
                        {company.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {company.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {company.industry && (
                    <Badge variant="secondary">{company.industry}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {company.website_url && (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-4 w-4" />
                      Сайт
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleVerify.mutate({
                        id: company.id,
                        is_verified: !company.is_verified,
                      })
                    }
                  >
                    {company.is_verified ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCompany(company)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsLinkUserOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCompany.mutate(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Company Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать: {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <CompanyForm
              initialData={selectedCompany}
              onSubmit={(data) =>
                updateCompany.mutate({ id: selectedCompany.id, ...data })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Link User Dialog */}
      <Dialog open={isLinkUserOpen} onOpenChange={setIsLinkUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить сотрудника: {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          <LinkUserForm
            users={users || []}
            companyId={selectedCompany?.id || ""}
            onSubmit={(userId, role) =>
              linkUser.mutate({
                userId,
                companyId: selectedCompany?.id || "",
                role,
              })
            }
          />
        </DialogContent>
      </Dialog>

      {/* View Company Employees Dialog */}
      <Dialog open={!!viewingCompany} onOpenChange={() => setViewingCompany(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {viewingCompany?.name}
              {viewingCompany?.is_verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingCompany?.description && (
              <p className="text-gray-600">{viewingCompany.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              {viewingCompany?.industry && (
                <Badge variant="secondary">{viewingCompany.industry}</Badge>
              )}
              {viewingCompany?.website_url && (
                <a
                  href={viewingCompany.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {viewingCompany.website_url}
                </a>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">Сотрудники</h4>
              {companyEmployees?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Пока никого нет</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyEmployees?.map((uc) => (
                      <TableRow key={uc.id}>
                        <TableCell>
                          {uc.user?.first_name} {uc.user?.last_name}
                          {uc.user?.username && (
                            <span className="text-gray-500 ml-1">
                              @{uc.user.username}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{uc.role || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(uc.joined_at).toLocaleDateString("ru-RU")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserFromCompany.mutate(uc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Company Form (Create/Edit)
function CompanyForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<Company>;
  onSubmit: (data: Partial<Company>) => void;
}) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    logo_url: initialData?.logo_url || "",
    website_url: initialData?.website_url || "",
    description: initialData?.description || "",
    industry: initialData?.industry || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      description: form.description || null,
      industry: form.industry || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Название*</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="MAIN Community"
          required
        />
      </div>
      <div>
        <Label>Описание</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Краткое описание компании..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>URL логотипа</Label>
          <Input
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Сайт</Label>
          <Input
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </div>
      <div>
        <Label>Индустрия</Label>
        <Select
          value={form.industry}
          onValueChange={(value) => setForm({ ...form, industry: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите индустрию" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}

// Link User Form
function LinkUserForm({
  users,
  companyId,
  onSubmit,
}: {
  users: BotUser[];
  companyId: string;
  onSubmit: (userId: number, role: string) => void;
}) {
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(s) ||
      u.last_name?.toLowerCase().includes(s) ||
      u.username?.toLowerCase().includes(s)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      onSubmit(parseInt(userId), role);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Поиск пользователя</Label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Имя или username..."
          className="mb-2"
        />
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите пользователя" />
          </SelectTrigger>
          <SelectContent>
            {filteredUsers.slice(0, 50).map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.first_name} {user.last_name}
                {user.username && ` (@${user.username})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Роль в компании</Label>
        <Input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="CEO, CTO, Marketing Manager..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={!userId}>
        Добавить сотрудника
      </Button>
    </form>
  );
}

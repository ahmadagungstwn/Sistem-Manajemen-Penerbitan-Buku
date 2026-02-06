// File: src/pages/Toko.tsx
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db, Toko as TokoType } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Toko() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<TokoType>>({
    toko_id: "",
    nama: "",
    alamat: "",
    telepon: "",
  });

  const toko = useLiveQuery(() => db.toko.toArray());
  const filteredToko = toko?.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.toko.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengupdate toko: ${formData.nama}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Toko berhasil diupdate");
      } else {
        await db.toko.add(formData as TokoType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan toko: ${formData.nama}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Toko berhasil ditambahkan");
      }
      resetForm();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (item: TokoType) => {
    setEditingId(item.toko_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus toko ini?")) {
      try {
        await db.toko.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus toko: ${nama}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Toko berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({ toko_id: "", nama: "", alamat: "", telepon: "" });
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Toko</h1>
            <p className="text-muted-foreground">Kelola data toko distribusi</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Toko
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Toko" : "Tambah Toko Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="toko_id">ID Toko</Label>
                  <Input
                    id="toko_id"
                    value={formData.toko_id}
                    onChange={(e) =>
                      setFormData({ ...formData, toko_id: e.target.value })
                    }
                    disabled={!!editingId}
                    placeholder="T001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Toko</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, telepon: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update" : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari toko..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredToko && filteredToko.length > 0 ? (
                    filteredToko.map((item) => (
                      <TableRow key={item.toko_id}>
                        <TableCell className="font-medium">
                          {item.toko_id}
                        </TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.alamat}</TableCell>
                        <TableCell>{item.telepon}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(item.toko_id, item.nama)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

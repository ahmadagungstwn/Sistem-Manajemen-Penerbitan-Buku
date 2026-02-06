// File: src/pages/Pelanggan.tsx
// Halaman manajemen data pelanggan

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, Pelanggan } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, Trash2, UserCheck, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PelangganPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    email: "",
  });

  const pelangganList = useLiveQuery(() => db.pelanggan.toArray());

  const filteredPelanggan = pelangganList?.filter(
    (pelanggan) =>
      pelanggan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pelanggan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pelanggan.telepon.includes(searchTerm),
  );

  const resetForm = () => {
    setFormData({ nama: "", alamat: "", telepon: "", email: "" });
    setEditingPelanggan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPelanggan) {
        await db.pelanggan.update(editingPelanggan.pelanggan_id, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengubah data pelanggan: ${formData.nama}`,
          waktu: new Date().toISOString(),
        });
        toast({
          title: "Berhasil",
          description: "Data pelanggan berhasil diperbarui",
        });
      } else {
        const pelanggan_id = `PLG-${Date.now()}`;
        await db.pelanggan.add({ pelanggan_id, ...formData });
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan pelanggan baru: ${formData.nama}`,
          waktu: new Date().toISOString(),
        });
        toast({
          title: "Berhasil",
          description: "Pelanggan baru berhasil ditambahkan",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pelanggan: Pelanggan) => {
    setEditingPelanggan(pelanggan);
    setFormData({
      nama: pelanggan.nama,
      alamat: pelanggan.alamat,
      telepon: pelanggan.telepon,
      email: pelanggan.email,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (pelanggan: Pelanggan) => {
    if (confirm(`Hapus pelanggan "${pelanggan.nama}"?`)) {
      try {
        await db.pelanggan.delete(pelanggan.pelanggan_id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus pelanggan: ${pelanggan.nama}`,
          waktu: new Date().toISOString(),
        });
        toast({ title: "Berhasil", description: "Pelanggan berhasil dihapus" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pelanggan
            </h1>
            <p className="text-muted-foreground">Kelola data pelanggan</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPelanggan
                    ? "Edit Pelanggan"
                    : "Tambah Pelanggan Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama</Label>
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
                  <Input
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingPelanggan ? "Simpan" : "Tambah"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Daftar Pelanggan
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPelanggan && filteredPelanggan.length > 0 ? (
                  filteredPelanggan.map((pelanggan) => (
                    <TableRow key={pelanggan.pelanggan_id}>
                      <TableCell className="font-mono text-xs">
                        {pelanggan.pelanggan_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {pelanggan.nama}
                      </TableCell>
                      <TableCell>{pelanggan.alamat}</TableCell>
                      <TableCell>{pelanggan.telepon}</TableCell>
                      <TableCell>{pelanggan.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pelanggan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pelanggan)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "Tidak ada pelanggan yang cocok"
                        : "Belum ada data pelanggan"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

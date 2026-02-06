// File: src/pages/StokBuku.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db, StokBuku as StokBukuType } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function StokBuku() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<StokBukuType>>({
    stok_id: "",
    isbn: "",
    jumlah: 0,
    rak_id: "",
  });

  const stok = useLiveQuery(() => db.stok_buku.toArray());
  const buku = useLiveQuery(() => db.buku.toArray());
  const rak = useLiveQuery(() => db.rak.toArray());

  const filteredStok = stok?.filter((item) => {
    const bukuData = buku?.find((b) => b.isbn === item.isbn);
    return (
      bukuData?.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.stok_buku.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengupdate stok buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Stok berhasil diupdate");
      } else {
        await db.stok_buku.add(formData as StokBukuType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan stok buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Stok berhasil ditambahkan");
      }
      resetForm();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (item: StokBukuType) => {
    setEditingId(item.stok_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus stok ini?")) {
      try {
        await db.stok_buku.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus stok buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Stok berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({ stok_id: "", isbn: "", jumlah: 0, rak_id: "" });
    setEditingId(null);
    setIsOpen(false);
  };

  const getBukuJudul = (isbn: string) =>
    buku?.find((b) => b.isbn === isbn)?.judul || "-";
  const getRakKode = (id: string) =>
    rak?.find((r) => r.rak_id === id)?.kode_rak || "-";

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Data Stok Buku
            </h1>
            <p className="text-muted-foreground">
              Kelola stok buku di inventaris
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Stok
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Stok" : "Tambah Stok Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stok_id">ID Stok</Label>
                  <Input
                    id="stok_id"
                    value={formData.stok_id}
                    onChange={(e) =>
                      setFormData({ ...formData, stok_id: e.target.value })
                    }
                    disabled={!!editingId}
                    placeholder="STK001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">Buku</Label>
                  <Select
                    value={formData.isbn}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isbn: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih buku" />
                    </SelectTrigger>
                    <SelectContent>
                      {buku?.map((b) => (
                        <SelectItem key={b.isbn} value={b.isbn}>
                          {b.judul} ({b.isbn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rak">Rak</Label>
                  <Select
                    value={formData.rak_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rak_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rak" />
                    </SelectTrigger>
                    <SelectContent>
                      {rak?.map((r) => (
                        <SelectItem key={r.rak_id} value={r.rak_id}>
                          {r.kode_rak} - {r.lokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah</Label>
                  <Input
                    id="jumlah"
                    type="number"
                    value={formData.jumlah}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jumlah: parseInt(e.target.value),
                      })
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
                placeholder="Cari stok buku..."
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
                    <TableHead>ID Stok</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Rak</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStok && filteredStok.length > 0 ? (
                    filteredStok.map((item) => (
                      <TableRow key={item.stok_id}>
                        <TableCell className="font-medium">
                          {item.stok_id}
                        </TableCell>
                        <TableCell>{item.isbn}</TableCell>
                        <TableCell>{getBukuJudul(item.isbn)}</TableCell>
                        <TableCell>{getRakKode(item.rak_id)}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
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
                            onClick={() => handleDelete(item.stok_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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

// File: src/pages/Distribusi.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { db, Distribusi as DistribusiType } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function Distribusi() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<DistribusiType>>({
    distribusi_id: "",
    isbn: "",
    toko_id: "",
    jumlah: 0,
    tanggal_kirim: format(new Date(), "yyyy-MM-dd"),
    keterangan: "",
  });

  const distribusi = useLiveQuery(() => db.distribusi.toArray());
  const buku = useLiveQuery(() => db.buku.toArray());
  const toko = useLiveQuery(() => db.toko.toArray());

  const filteredDistribusi = distribusi?.filter((item) => {
    const bukuData = buku?.find((b) => b.isbn === item.isbn);
    const tokoData = toko?.find((t) => t.toko_id === item.toko_id);
    return (
      bukuData?.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tokoData?.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.distribusi.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengupdate distribusi`,
          waktu: new Date().toISOString(),
        });
        toast.success("Distribusi berhasil diupdate");
      } else {
        await db.distribusi.add(formData as DistribusiType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan distribusi buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Distribusi berhasil ditambahkan");
      }
      resetForm();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (item: DistribusiType) => {
    setEditingId(item.distribusi_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus distribusi ini?")) {
      try {
        await db.distribusi.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus distribusi`,
          waktu: new Date().toISOString(),
        });
        toast.success("Distribusi berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      distribusi_id: "",
      isbn: "",
      toko_id: "",
      jumlah: 0,
      tanggal_kirim: format(new Date(), "yyyy-MM-dd"),
      keterangan: "",
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const getBukuJudul = (isbn: string) =>
    buku?.find((b) => b.isbn === isbn)?.judul || "-";
  const getTokoNama = (id: string) =>
    toko?.find((t) => t.toko_id === id)?.nama || "-";

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Data Distribusi
            </h1>
            <p className="text-muted-foreground">
              Kelola distribusi buku ke toko
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Distribusi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Distribusi" : "Tambah Distribusi Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distribusi_id">ID Distribusi</Label>
                  <Input
                    id="distribusi_id"
                    value={formData.distribusi_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distribusi_id: e.target.value,
                      })
                    }
                    disabled={!!editingId}
                    placeholder="DIST001"
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
                          {b.judul}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toko">Toko</Label>
                  <Select
                    value={formData.toko_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, toko_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih toko" />
                    </SelectTrigger>
                    <SelectContent>
                      {toko?.map((t) => (
                        <SelectItem key={t.toko_id} value={t.toko_id}>
                          {t.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="tanggal">Tanggal Kirim</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal_kirim}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_kirim: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea
                    id="keterangan"
                    value={formData.keterangan}
                    onChange={(e) =>
                      setFormData({ ...formData, keterangan: e.target.value })
                    }
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
                placeholder="Cari distribusi..."
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
                    <TableHead>Buku</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistribusi && filteredDistribusi.length > 0 ? (
                    filteredDistribusi.map((item) => (
                      <TableRow key={item.distribusi_id}>
                        <TableCell className="font-medium">
                          {item.distribusi_id}
                        </TableCell>
                        <TableCell>{getBukuJudul(item.isbn)}</TableCell>
                        <TableCell>{getTokoNama(item.toko_id)}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{item.tanggal_kirim}</TableCell>
                        <TableCell>{item.keterangan}</TableCell>
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
                            onClick={() => handleDelete(item.distribusi_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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

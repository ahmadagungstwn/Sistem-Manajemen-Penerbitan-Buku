// File: src/pages/ReturBuku.tsx
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
import { db, ReturBuku as ReturBukuType } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function ReturBuku() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<ReturBukuType>>({
    retur_id: "",
    distribusi_id: "",
    tanggal_retour: format(new Date(), "yyyy-MM-dd"),
    jumlah: 0,
    kondisi: "",
  });

  const retur = useLiveQuery(() => db.retur_buku.toArray());
  const distribusi = useLiveQuery(() => db.distribusi.toArray());

  const filteredRetur = retur?.filter((item) =>
    item.retur_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.retur_buku.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengupdate retur buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Retur berhasil diupdate");
      } else {
        await db.retur_buku.add(formData as ReturBukuType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan retur buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Retur berhasil ditambahkan");
      }
      resetForm();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (item: ReturBukuType) => {
    setEditingId(item.retur_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus retur ini?")) {
      try {
        await db.retur_buku.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus retur buku`,
          waktu: new Date().toISOString(),
        });
        toast.success("Retur berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      retur_id: "",
      distribusi_id: "",
      tanggal_retour: format(new Date(), "yyyy-MM-dd"),
      jumlah: 0,
      kondisi: "",
    });
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Data Retur Buku
            </h1>
            <p className="text-muted-foreground">
              Kelola data retur buku dari distribusi
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Retur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Retur" : "Tambah Retur Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retur_id">ID Retur</Label>
                  <Input
                    id="retur_id"
                    value={formData.retur_id}
                    onChange={(e) =>
                      setFormData({ ...formData, retur_id: e.target.value })
                    }
                    disabled={!!editingId}
                    placeholder="RET001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distribusi">Distribusi</Label>
                  <Select
                    value={formData.distribusi_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, distribusi_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih distribusi" />
                    </SelectTrigger>
                    <SelectContent>
                      {distribusi?.map((d) => (
                        <SelectItem
                          key={d.distribusi_id}
                          value={d.distribusi_id}
                        >
                          {d.distribusi_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal">Tanggal Retur</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal_retour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_retour: e.target.value,
                        })
                      }
                      required
                    />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kondisi">Kondisi</Label>
                  <Select
                    value={formData.kondisi}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kondisi: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baik">Baik</SelectItem>
                      <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                      <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                    </SelectContent>
                  </Select>
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
                placeholder="Cari retur..."
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
                    <TableHead>ID Retur</TableHead>
                    <TableHead>ID Distribusi</TableHead>
                    <TableHead>Tanggal Retur</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRetur && filteredRetur.length > 0 ? (
                    filteredRetur.map((item) => (
                      <TableRow key={item.retur_id}>
                        <TableCell className="font-medium">
                          {item.retur_id}
                        </TableCell>
                        <TableCell>{item.distribusi_id}</TableCell>
                        <TableCell>{item.tanggal_retour}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{item.kondisi}</TableCell>
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
                            onClick={() => handleDelete(item.retur_id)}
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

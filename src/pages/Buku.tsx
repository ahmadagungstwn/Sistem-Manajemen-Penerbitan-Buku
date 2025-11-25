import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { db, Buku as BukuType } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Buku() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<BukuType>>({
    isbn: "",
    judul: "",
    penulis_id: "",
    penerbit_id: "",
    kategori_id: "",
    tahun_terbit: new Date().getFullYear(),
    harga: 0,
  });

  const buku = useLiveQuery(() => db.buku.toArray());
  const penulis = useLiveQuery(() => db.penulis.toArray());
  const penerbit = useLiveQuery(() => db.penerbit.toArray());
  const kategori = useLiveQuery(() => db.kategori.toArray());

  const filteredBuku = buku?.filter(
    (item) =>
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.buku.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengupdate buku: ${formData.judul}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Buku berhasil diupdate");
      } else {
        await db.buku.add(formData as BukuType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan buku: ${formData.judul}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Buku berhasil ditambahkan");
      }
      resetForm();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (item: BukuType) => {
    setEditingId(item.isbn);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (isbn: string, judul: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
      try {
        await db.buku.delete(isbn);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus buku: ${judul}`,
          waktu: new Date().toISOString(),
        });
        toast.success("Buku berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      isbn: "",
      judul: "",
      penulis_id: "",
      penerbit_id: "",
      kategori_id: "",
      tahun_terbit: new Date().getFullYear(),
      harga: 0,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const getPenulisName = (id: string) =>
    penulis?.find((p) => p.penulis_id === id)?.nama || "-";
  const getPenerbitName = (id: string) =>
    penerbit?.find((p) => p.penerbit_id === id)?.nama || "-";
  const getKategoriName = (id: string) =>
    kategori?.find((k) => k.kategori_id === id)?.nama || "-";

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Data Buku
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola data buku yang tersedia
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Buku
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Buku" : "Tambah Buku Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                      disabled={!!editingId}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="judul">Judul Buku</Label>
                    <Input
                      id="judul"
                      value={formData.judul}
                      onChange={(e) =>
                        setFormData({ ...formData, judul: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="penulis">Penulis</Label>
                    <Select
                      value={formData.penulis_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, penulis_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih penulis" />
                      </SelectTrigger>
                      <SelectContent>
                        {penulis?.map((p) => (
                          <SelectItem key={p.penulis_id} value={p.penulis_id}>
                            {p.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="penerbit">Penerbit</Label>
                    <Select
                      value={formData.penerbit_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, penerbit_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih penerbit" />
                      </SelectTrigger>
                      <SelectContent>
                        {penerbit?.map((p) => (
                          <SelectItem key={p.penerbit_id} value={p.penerbit_id}>
                            {p.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori</Label>
                    <Select
                      value={formData.kategori_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, kategori_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategori?.map((k) => (
                          <SelectItem key={k.kategori_id} value={k.kategori_id}>
                            {k.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahun">Tahun Terbit</Label>
                    <Input
                      id="tahun"
                      type="number"
                      value={formData.tahun_terbit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tahun_terbit: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harga">Harga</Label>
                    <Input
                      id="harga"
                      type="number"
                      value={formData.harga}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harga: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingId ? "Update" : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari buku..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Penerbit</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuku && filteredBuku.length > 0 ? (
                    filteredBuku.map((item) => (
                      <TableRow key={item.isbn}>
                        <TableCell className="font-medium">
                          {item.isbn}
                        </TableCell>
                        <TableCell>{item.judul}</TableCell>
                        <TableCell>{getPenulisName(item.penulis_id)}</TableCell>
                        <TableCell>
                          {getPenerbitName(item.penerbit_id)}
                        </TableCell>
                        <TableCell>
                          {getKategoriName(item.kategori_id)}
                        </TableCell>
                        <TableCell>{item.tahun_terbit}</TableCell>
                        <TableCell>
                          Rp {item.harga.toLocaleString("id-ID")}
                        </TableCell>
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
                            onClick={() => handleDelete(item.isbn, item.judul)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredBuku && filteredBuku.length > 0 ? (
                filteredBuku.map((item) => (
                  <Card key={item.isbn} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {item.judul}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ISBN: {item.isbn}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDelete(item.isbn, item.judul)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Penulis:
                            </span>
                            <p className="font-medium truncate">
                              {getPenulisName(item.penulis_id)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Penerbit:
                            </span>
                            <p className="font-medium truncate">
                              {getPenerbitName(item.penerbit_id)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Kategori:
                            </span>
                            <p className="font-medium truncate">
                              {getKategoriName(item.kategori_id)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Tahun:
                            </span>
                            <p className="font-medium">{item.tahun_terbit}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Harga:
                          </span>
                          <p className="text-lg font-bold text-primary">
                            Rp {item.harga.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

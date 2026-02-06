// File: src/pages/Penjualan.tsx
// Halaman manajemen data penjualan

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { db, Penjualan } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useAuth } from "../hooks/useAuth";
import { Plus, Pencil, Trash2, ShoppingCart, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PenjualanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPenjualan, setEditingPenjualan] = useState<Penjualan | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    pelanggan_id: "",
    isbn: "",
    jumlah: 1,
    tanggal_jual: new Date().toISOString().split("T")[0],
    total_harga: 0,
    keterangan: "",
  });

  const penjualanList = useLiveQuery(() => db.penjualan.toArray());
  const pelangganList = useLiveQuery(() => db.pelanggan.toArray());
  const bukuList = useLiveQuery(() => db.buku.toArray());

  const filteredPenjualan = penjualanList?.filter((penjualan) => {
    const pelanggan = pelangganList?.find(
      (p) => p.pelanggan_id === penjualan.pelanggan_id,
    );
    const buku = bukuList?.find((b) => b.isbn === penjualan.isbn);
    return (
      pelanggan?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buku?.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      penjualan.penjualan_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const resetForm = () => {
    setFormData({
      pelanggan_id: "",
      isbn: "",
      jumlah: 1,
      tanggal_jual: new Date().toISOString().split("T")[0],
      total_harga: 0,
      keterangan: "",
    });
    setEditingPenjualan(null);
  };

  const calculateTotal = (isbn: string, jumlah: number) => {
    const buku = bukuList?.find((b) => b.isbn === isbn);
    return buku ? buku.harga * jumlah : 0;
  };

  const handleIsbnChange = (isbn: string) => {
    const total = calculateTotal(isbn, formData.jumlah);
    setFormData({ ...formData, isbn, total_harga: total });
  };

  const handleJumlahChange = (jumlah: number) => {
    const total = calculateTotal(formData.isbn, jumlah);
    setFormData({ ...formData, jumlah, total_harga: total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPenjualan) {
        await db.penjualan.update(editingPenjualan.penjualan_id, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Mengubah data penjualan: ${editingPenjualan.penjualan_id}`,
          waktu: new Date().toISOString(),
        });
        toast({
          title: "Berhasil",
          description: "Data penjualan berhasil diperbarui",
        });
      } else {
        const penjualan_id = `PNJ-${Date.now()}`;
        await db.penjualan.add({ penjualan_id, ...formData });
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menambahkan penjualan baru: ${penjualan_id}`,
          waktu: new Date().toISOString(),
        });
        toast({
          title: "Berhasil",
          description: "Penjualan baru berhasil ditambahkan",
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

  const handleEdit = (penjualan: Penjualan) => {
    setEditingPenjualan(penjualan);
    setFormData({
      pelanggan_id: penjualan.pelanggan_id,
      isbn: penjualan.isbn,
      jumlah: penjualan.jumlah,
      tanggal_jual: penjualan.tanggal_jual,
      total_harga: penjualan.total_harga,
      keterangan: penjualan.keterangan,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (penjualan: Penjualan) => {
    if (confirm(`Hapus penjualan "${penjualan.penjualan_id}"?`)) {
      try {
        await db.penjualan.delete(penjualan.penjualan_id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || "unknown",
          aktivitas: `Menghapus penjualan: ${penjualan.penjualan_id}`,
          waktu: new Date().toISOString(),
        });
        toast({ title: "Berhasil", description: "Penjualan berhasil dihapus" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    }
  };

  const getPelangganNama = (pelanggan_id: string) => {
    const pelanggan = pelangganList?.find(
      (p) => p.pelanggan_id === pelanggan_id,
    );
    return pelanggan?.nama || "-";
  };

  const getBukuJudul = (isbn: string) => {
    const buku = bukuList?.find((b) => b.isbn === isbn);
    return buku?.judul || "-";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Penjualan
            </h1>
            <p className="text-muted-foreground">
              Kelola data transaksi penjualan
            </p>
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
                Tambah Penjualan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPenjualan
                    ? "Edit Penjualan"
                    : "Tambah Penjualan Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pelanggan_id">Pelanggan</Label>
                  <Select
                    value={formData.pelanggan_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pelanggan_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {pelangganList?.map((pelanggan) => (
                        <SelectItem
                          key={pelanggan.pelanggan_id}
                          value={pelanggan.pelanggan_id}
                        >
                          {pelanggan.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">Buku</Label>
                  <Select
                    value={formData.isbn}
                    onValueChange={handleIsbnChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih buku" />
                    </SelectTrigger>
                    <SelectContent>
                      {bukuList?.map((buku) => (
                        <SelectItem key={buku.isbn} value={buku.isbn}>
                          {buku.judul} - {formatCurrency(buku.harga)}
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
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) =>
                      handleJumlahChange(parseInt(e.target.value) || 1)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_jual">Tanggal Jual</Label>
                  <Input
                    id="tanggal_jual"
                    type="date"
                    value={formData.tanggal_jual}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal_jual: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_harga">Total Harga</Label>
                  <Input
                    id="total_harga"
                    value={formatCurrency(formData.total_harga)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Input
                    id="keterangan"
                    value={formData.keterangan}
                    onChange={(e) =>
                      setFormData({ ...formData, keterangan: e.target.value })
                    }
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
                    {editingPenjualan ? "Simpan" : "Tambah"}
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
                <ShoppingCart className="h-5 w-5" />
                Daftar Penjualan
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari penjualan..."
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
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Buku</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPenjualan && filteredPenjualan.length > 0 ? (
                  filteredPenjualan.map((penjualan) => (
                    <TableRow key={penjualan.penjualan_id}>
                      <TableCell className="font-mono text-xs">
                        {penjualan.penjualan_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getPelangganNama(penjualan.pelanggan_id)}
                      </TableCell>
                      <TableCell>{getBukuJudul(penjualan.isbn)}</TableCell>
                      <TableCell>{penjualan.jumlah}</TableCell>
                      <TableCell>
                        {format(
                          new Date(penjualan.tanggal_jual),
                          "dd MMM yyyy",
                          { locale: id },
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(penjualan.total_harga)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(penjualan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(penjualan)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "Tidak ada penjualan yang cocok"
                        : "Belum ada data penjualan"}
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

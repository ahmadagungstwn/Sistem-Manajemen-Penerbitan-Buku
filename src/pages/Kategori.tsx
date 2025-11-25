// File: src/pages/Kategori.tsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db, Kategori as KategoriType } from '@/db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Kategori() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<KategoriType>>({
    kategori_id: '',
    nama: '',
    deskripsi: '',
  });

  const kategori = useLiveQuery(() => db.kategori.toArray());
  const filteredKategori = kategori?.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.kategori.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Mengupdate kategori: ${formData.nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Kategori berhasil diupdate');
      } else {
        await db.kategori.add(formData as KategoriType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menambahkan kategori: ${formData.nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Kategori berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: KategoriType) => {
    setEditingId(item.kategori_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await db.kategori.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menghapus kategori: ${nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Kategori berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const resetForm = () => {
    setFormData({ kategori_id: '', nama: '', deskripsi: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Kategori</h1>
            <p className="text-muted-foreground">Kelola kategori buku</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kategori_id">ID Kategori</Label>
                  <Input
                    id="kategori_id"
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                    disabled={!!editingId}
                    placeholder="K001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Kategori</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                  <Button type="submit">{editingId ? 'Update' : 'Simpan'}</Button>
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
                placeholder="Cari kategori..."
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
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKategori && filteredKategori.length > 0 ? (
                    filteredKategori.map((item) => (
                      <TableRow key={item.kategori_id}>
                        <TableCell className="font-medium">{item.kategori_id}</TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.deskripsi}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.kategori_id, item.nama)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">Tidak ada data</TableCell>
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

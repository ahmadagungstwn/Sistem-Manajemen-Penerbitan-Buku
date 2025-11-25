// File: src/pages/Penerbit.tsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db, Penerbit as PenerbitType } from '@/db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Penerbit() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<PenerbitType>>({
    penerbit_id: '',
    nama: '',
    alamat: '',
    telepon: '',
  });

  const penerbit = useLiveQuery(() => db.penerbit.toArray());
  const filteredPenerbit = penerbit?.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.penerbit.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Mengupdate penerbit: ${formData.nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Penerbit berhasil diupdate');
      } else {
        await db.penerbit.add(formData as PenerbitType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menambahkan penerbit: ${formData.nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Penerbit berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: PenerbitType) => {
    setEditingId(item.penerbit_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus penerbit ini?')) {
      try {
        await db.penerbit.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menghapus penerbit: ${nama}`,
          waktu: new Date().toISOString()
        });
        toast.success('Penerbit berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const resetForm = () => {
    setFormData({ penerbit_id: '', nama: '', alamat: '', telepon: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Penerbit</h1>
            <p className="text-muted-foreground">Kelola data penerbit buku</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Penerbit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Penerbit' : 'Tambah Penerbit Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="penerbit_id">ID Penerbit</Label>
                  <Input
                    id="penerbit_id"
                    value={formData.penerbit_id}
                    onChange={(e) => setFormData({ ...formData, penerbit_id: e.target.value })}
                    disabled={!!editingId}
                    placeholder="PB001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Penerbit</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
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
                placeholder="Cari penerbit..."
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
                  {filteredPenerbit && filteredPenerbit.length > 0 ? (
                    filteredPenerbit.map((item) => (
                      <TableRow key={item.penerbit_id}>
                        <TableCell className="font-medium">{item.penerbit_id}</TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.alamat}</TableCell>
                        <TableCell>{item.telepon}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.penerbit_id, item.nama)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">Tidak ada data</TableCell>
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

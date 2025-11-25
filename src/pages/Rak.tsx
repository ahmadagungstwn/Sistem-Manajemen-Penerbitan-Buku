// File: src/pages/Rak.tsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { db, Rak as RakType } from '@/db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Rak() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<RakType>>({
    rak_id: '',
    lokasi: '',
    kode_rak: '',
  });

  const rak = useLiveQuery(() => db.rak.toArray());
  const filteredRak = rak?.filter(item =>
    item.kode_rak.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.rak.update(editingId, formData);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Mengupdate rak: ${formData.kode_rak}`,
          waktu: new Date().toISOString()
        });
        toast.success('Rak berhasil diupdate');
      } else {
        await db.rak.add(formData as RakType);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menambahkan rak: ${formData.kode_rak}`,
          waktu: new Date().toISOString()
        });
        toast.success('Rak berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: RakType) => {
    setEditingId(item.rak_id);
    setFormData(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, kode: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rak ini?')) {
      try {
        await db.rak.delete(id);
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: user?.username || 'unknown',
          aktivitas: `Menghapus rak: ${kode}`,
          waktu: new Date().toISOString()
        });
        toast.success('Rak berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const resetForm = () => {
    setFormData({ rak_id: '', lokasi: '', kode_rak: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Rak</h1>
            <p className="text-muted-foreground">Kelola data rak penyimpanan buku</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Rak
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Rak' : 'Tambah Rak Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rak_id">ID Rak</Label>
                  <Input
                    id="rak_id"
                    value={formData.rak_id}
                    onChange={(e) => setFormData({ ...formData, rak_id: e.target.value })}
                    disabled={!!editingId}
                    placeholder="R001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode_rak">Kode Rak</Label>
                  <Input
                    id="kode_rak"
                    value={formData.kode_rak}
                    onChange={(e) => setFormData({ ...formData, kode_rak: e.target.value })}
                    placeholder="A-01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <Input
                    id="lokasi"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    placeholder="Gedung A, Lantai 1"
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
                placeholder="Cari rak..."
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
                    <TableHead>ID Rak</TableHead>
                    <TableHead>Kode Rak</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRak && filteredRak.length > 0 ? (
                    filteredRak.map((item) => (
                      <TableRow key={item.rak_id}>
                        <TableCell className="font-medium">{item.rak_id}</TableCell>
                        <TableCell>{item.kode_rak}</TableCell>
                        <TableCell>{item.lokasi}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.rak_id, item.kode_rak)}>
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

// File: src/pages/Dashboard.tsx
// Halaman dashboard utama dengan statistik

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import {
  BookOpen,
  Users,
  Building2,
  Package,
  Store,
  TruckIcon,
  RotateCcw,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Dashboard() {
  const bukuCount = useLiveQuery(() => db.buku.count());
  const penulisCount = useLiveQuery(() => db.penulis.count());
  const penerbitCount = useLiveQuery(() => db.penerbit.count());
  const stokCount = useLiveQuery(() => db.stok_buku.count());
  const tokoCount = useLiveQuery(() => db.toko.count());
  const distribusiCount = useLiveQuery(() => db.distribusi.count());
  const returCount = useLiveQuery(() => db.retur_buku.count());
  const kategoriCount = useLiveQuery(() => db.kategori.count());

  const recentActivities = useLiveQuery(() =>
    db.log_aktivitas.orderBy("waktu").reverse().limit(10).toArray()
  );

  const totalStok = useLiveQuery(async () => {
    const stoks = await db.stok_buku.toArray();
    return stoks.reduce((acc, stok) => acc + (stok.jumlah || 0), 0);
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di Sistem Manajemen Penerbitan dan Inventaris Buku
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Buku"
            value={bukuCount ?? 0}
            icon={BookOpen}
            description="Judul buku terdaftar"
          />
          <StatCard
            title="Total Penulis"
            value={penulisCount ?? 0}
            icon={Users}
            description="Penulis terdaftar"
          />
          <StatCard
            title="Total Penerbit"
            value={penerbitCount ?? 0}
            icon={Building2}
            description="Penerbit terdaftar"
          />
          <StatCard
            title="Total Stok"
            value={totalStok ?? 0}
            icon={Package}
            description="Buku dalam inventaris"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Toko"
            value={tokoCount ?? 0}
            icon={Store}
            description="Toko distribusi"
          />
          <StatCard
            title="Total Distribusi"
            value={distribusiCount ?? 0}
            icon={TruckIcon}
            description="Distribusi tercatat"
          />
          <StatCard
            title="Total Retur"
            value={returCount ?? 0}
            icon={RotateCcw}
            description="Retur buku"
          />
          <StatCard
            title="Total Kategori"
            value={kategoriCount ?? 0}
            icon={Tag}
            description="Kategori buku"
          />
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((log) => (
                  <div
                    key={log.log_id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {log.aktivitas}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        oleh {log.username} •{" "}
                        {format(new Date(log.waktu), "dd MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada aktivitas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// File: src/db/database.ts
// IndexedDB Database Setup menggunakan Dexie

import Dexie, { Table } from "dexie";

// Interface untuk setiap tabel
export interface Penulis {
  penulis_id: string;
  nama: string;
  negara: string;
}

export interface Penerbit {
  penerbit_id: string;
  nama: string;
  alamat: string;
  telepon: string;
}

export interface Kategori {
  kategori_id: string;
  nama: string;
  deskripsi: string;
}

export interface Rak {
  rak_id: string;
  lokasi: string;
  kode_rak: string;
}

export interface Buku {
  isbn: string;
  judul: string;
  penulis_id: string;
  penerbit_id: string;
  kategori_id: string;
  tahun_terbit: number;
  harga: number;
}

export interface StokBuku {
  stok_id: string;
  isbn: string;
  jumlah: number;
  rak_id: string;
}

export interface Toko {
  toko_id: string;
  nama: string;
  alamat: string;
  telepon: string;
}

export interface Distribusi {
  distribusi_id: string;
  isbn: string;
  toko_id: string;
  jumlah: number;
  tanggal_kirim: string;
  keterangan: string;
}

export interface ReturBuku {
  retur_id: string;
  distribusi_id: string;
  tanggal_retour: string;
  jumlah: number;
  kondisi: string;
}

export interface Pelanggan {
  pelanggan_id: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
}

export interface Penjualan {
  penjualan_id: string;
  pelanggan_id: string;
  isbn: string;
  jumlah: number;
  tanggal_jual: string;
  total_harga: number;
  keterangan: string;
}

export interface User {
  username: string;
  password: string;
  role: string;
  nama_lengkap: string;
}

export interface LogAktivitas {
  log_id: string;
  username: string;
  aktivitas: string;
  waktu: string;
}

// Definisi Database
export class BukuDatabase extends Dexie {
  penulis!: Table<Penulis>;
  penerbit!: Table<Penerbit>;
  kategori!: Table<Kategori>;
  rak!: Table<Rak>;
  buku!: Table<Buku>;
  stok_buku!: Table<StokBuku>;
  toko!: Table<Toko>;
  distribusi!: Table<Distribusi>;
  retur_buku!: Table<ReturBuku>;
  pelanggan!: Table<Pelanggan>;
  penjualan!: Table<Penjualan>;
  users!: Table<User>;
  log_aktivitas!: Table<LogAktivitas>;

  constructor() {
    super("BukuDatabase");

    this.version(2).stores({
      penulis: "penulis_id, nama, negara",
      penerbit: "penerbit_id, nama",
      kategori: "kategori_id, nama",
      rak: "rak_id, kode_rak",
      buku: "isbn, judul, penulis_id, penerbit_id, kategori_id",
      stok_buku: "stok_id, isbn, rak_id",
      toko: "toko_id, nama",
      distribusi: "distribusi_id, isbn, toko_id, tanggal_kirim",
      retur_buku: "retur_id, distribusi_id, tanggal_retour",
      pelanggan: "pelanggan_id, nama, telepon, email",
      penjualan: "penjualan_id, pelanggan_id, isbn, tanggal_jual",
      users: "username, role",
      log_aktivitas: "log_id, username, waktu",
    });
  }
}

// Instance database
export const db = new BukuDatabase();

// Seed data awal (admin user)
export async function seedInitialData() {
  const userCount = await db.users.count();

  if (userCount === 0) {
    // Create default admin user
    await db.users.add({
      username: "teamsipib",
      password: "teamsipib2026",
      role: "admin",
      nama_lengkap: "Administrator",
    });

    // Log aktivitas
    await db.log_aktivitas.add({
      log_id: `LOG-${Date.now()}`,
      username: "system",
      aktivitas: "Inisialisasi database",
      waktu: new Date().toISOString(),
    });
  }
}

// layout.tsx
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          <li><a href="/admin/dashboard/categories">Categories</a></li>
          <li><a href="/admin/dashboard/view-all">View All</a></li>
          <li><a href="/admin/dashboard/add-item">Add Item</a></li>
        </ul>
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

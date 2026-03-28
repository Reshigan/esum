"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface Contract {
  id: string;
  contract_type: string;
  status: string;
  buyer_org_name: string;
  seller_org_name: string;
  instrument_name: string;
  total_contracted_mwh: number;
  price_terms: any;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  async function fetchContracts() {
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      
      const response = await fetch(`/api/contracts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch contracts");

      const data = await response.json();
      setContracts(data.data);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_signature":
      case "partially_signed":
        return "bg-amber-100 text-amber-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "physical_ppa":
        return "bg-green-100 text-green-700";
      case "vppa":
        return "bg-blue-100 text-blue-700";
      case "term":
        return "bg-purple-100 text-purple-700";
      case "spot":
        return "bg-amber-100 text-amber-700";
      case "wheeling":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and sign your energy contracts</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Create Contract
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="px-8 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending_signature")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "pending_signature"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Awaiting Signature
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "active"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "draft"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        {/* Contracts List */}
        <div className="px-8 pb-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new contract</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/contracts/${contract.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(contract.contract_type)}`}>
                          {contract.contract_type.replace("_", " ").toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{contract.instrument_name}</h3>
                      <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Buyer:</span>
                          <span className="ml-2 font-medium text-gray-900">{contract.buyer_org_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Seller:</span>
                          <span className="ml-2 font-medium text-gray-900">{contract.seller_org_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <span className="ml-2 font-medium text-gray-900">{contract.total_contracted_mwh.toLocaleString()} MWh</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            R {contract.price_terms?.price_per_mwh?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>Start: {new Date(contract.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(contract.end_date).toLocaleDateString()}</span>
                        <span>Created: {new Date(contract.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/contracts/${contract.id}/sign`);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          contract.status === "pending_signature" || contract.status === "partially_signed"
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {contract.status === "pending_signature" || contract.status === "partially_signed"
                          ? "Sign Now"
                          : "View"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

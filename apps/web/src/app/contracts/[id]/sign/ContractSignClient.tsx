"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";
import { SignaturePad } from "@esum/ui-components";

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
  signatures?: Signature[];
}

interface Signature {
  id: string;
  signer_name: string;
  signer_role: string;
  signer_email: string;
  status: string;
  signed_at?: string;
}

interface SignatureData {
  consent_given: boolean;
  consent_timestamp: string;
  ip_address: string;
  user_agent: string;
  geolocation: {
    latitude: number;
    longitude: number;
    country: string;
  };
}

export default function ContractSignPage() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureId, setSignatureId] = useState<string | null>(null);
  const signaturePadRef = useRef<HTMLCanvasElement>(null);
  
  // Signature state
  const [consentGiven, setConsentGiven] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ipAddress, setIpAddress] = useState<string>("");

  useEffect(() => {
    fetchContract();
    getGeolocation();
    getIPAddress();
  }, [contractId]);

  async function fetchContract() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/contracts/${contractId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contract");
      }

      const data = await response.json();
      setContract(data.data);

      // Check if there's a pending signature for current user
      const userSignature = data.data.signatures?.find(
        (s: Signature) => s.status === "pending"
      );
      if (userSignature) {
        setSignatureId(userSignature.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function getGeolocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation permission denied");
        }
      );
    }
  }

  async function getIPAddress() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIpAddress(data.ip);
    } catch {
      setIpAddress("unknown");
    }
  }

  async function handleSign() {
    if (!consentGiven || !signatureId) return;

    setSigning(true);
    try {
      const token = localStorage.getItem("access_token");
      const signatureData: SignatureData = {
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        geolocation: {
          latitude: geolocation?.lat || 0,
          longitude: geolocation?.lng || 0,
          country: "ZA",
        },
      };

      const response = await fetch(`/api/contracts/${contractId}/signatures/${signatureId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(signatureData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute signature");
      }

      setSigned(true);
      
      // Refresh contract data
      setTimeout(fetchContract, 1000);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to sign contract");
    } finally {
      setSigning(false);
    }
  }

  async function handleDecline() {
    if (!signatureId) return;

    const reason = prompt("Please provide a reason for declining:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/contracts/${contractId}/signatures/${signatureId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline signature");
      }

      showSuccess("Signature declined successfully");
      router.push("/contracts");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to decline signature");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Sidebar />
        <div className="ml-[220px] p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Sidebar />
        <div className="ml-[220px] p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Contract</h2>
            <p className="text-red-600 mt-2">{error || "Contract not found"}</p>
            <button
              onClick={() => router.push("/contracts")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Contracts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mySignature = contract.signatures?.find(s => s.status === "pending");
  const allSigned = contract.signatures?.every(s => s.status === "signed");

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Sign Contract</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  contract.status === "active" ? "bg-green-100 text-green-700" :
                  contract.status === "pending_signature" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {contract.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{contract.contract_type} Agreement</p>
            </div>
            <button
              onClick={() => router.push("/contracts")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Contracts
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contract Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contract Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Buyer</p>
                      <p className="font-medium text-gray-900">{contract.buyer_org_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seller</p>
                      <p className="font-medium text-gray-900">{contract.seller_org_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instrument</p>
                      <p className="font-medium text-gray-900">{contract.instrument_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Volume</p>
                      <p className="font-medium text-gray-900">{contract.total_contracted_mwh.toLocaleString()} MWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-gray-900">
                        R {contract.price_terms?.price_per_mwh?.toFixed(2) || "0.00"}/MWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="font-medium text-gray-900">
                        R {(contract.total_contracted_mwh * (contract.price_terms?.price_per_mwh || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{new Date(contract.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">{new Date(contract.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Document */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Document</h2>
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-[400px]">
                  <div className="text-center text-gray-500 py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-sm">Contract document preview would appear here</p>
                    <p className="text-xs text-gray-400 mt-2">
                      In production, this displays the PDF generated by the contract engine
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Panel */}
            <div className="space-y-6">
              {/* Signatures Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h2>
                <div className="space-y-3">
                  {contract.signatures?.map((sig) => (
                    <div
                      key={sig.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        sig.status === "signed" ? "bg-green-50" :
                        sig.status === "pending" ? "bg-amber-50" :
                        "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{sig.signer_name}</p>
                        <p className="text-sm text-gray-500">{sig.signer_role}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sig.status === "signed" ? "bg-green-100 text-green-800" :
                          sig.status === "pending" ? "bg-amber-100 text-amber-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {sig.status === "signed" ? "✓ Signed" :
                           sig.status === "pending" ? "⏳ Pending" :
                           "○ " + sig.status}
                        </span>
                        {sig.signed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(sig.signed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {allSigned && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-800">✓ All parties have signed</p>
                    <p className="text-xs text-green-600 mt-1">Contract is now active</p>
                  </div>
                )}
              </div>

              {/* Signature Action */}
              {mySignature && !signed ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Signature Required</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Legal Notice:</strong> By signing this contract electronically, you agree to be bound by its terms.
                        This electronic signature has the same legal validity as a handwritten signature under South African law (ECTA).
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Signature</h3>
                        <SignaturePad 
                          onEnd={() => {
                            // Enable consent when user starts drawing
                            if (!consentGiven) {
                              setConsentGiven(true);
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                          className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="consent" className="ml-3 text-sm text-gray-700">
                          I consent to using electronic signatures and agree that my signature, 
                          IP address ({ipAddress || "loading..."}), 
                          {geolocation && ` location (${geolocation.lat.toFixed(4)}, ${geolocation.lng.toFixed(4)}),`}
                          and timestamp will be recorded for legal compliance.
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        onClick={handleSign}
                        disabled={!consentGiven || signing}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                          !consentGiven || signing
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {signing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing...
                          </span>
                        ) : (
                          "Sign Contract"
                        )}
                      </button>

                      <button
                        onClick={handleDecline}
                        disabled={signing}
                        className="w-full py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Decline to Sign
                      </button>
                    </div>

                    {signed && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">✓ Successfully Signed!</p>
                        <p className="text-xs text-green-600 mt-1">
                          A signature certificate has been generated and sent to your email.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                  {allSigned ? (
                    <>
                      <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Contract Fully Executed</h3>
                      <p className="mt-1 text-sm text-gray-500">All parties have signed the contract</p>
                    </>
                  ) : mySignature ? (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Awaiting Your Signature</h3>
                      <p className="mt-1 text-sm text-gray-500">Please review and sign the contract</p>
                    </>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Signature Required</h3>
                      <p className="mt-1 text-sm text-gray-500">You are not a required signer for this contract</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

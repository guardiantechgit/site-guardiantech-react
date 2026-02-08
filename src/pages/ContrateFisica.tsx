import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { onlyDigits, formatPhoneBR, formatCPF, formatCEP, formatPlate, sanitizeUsername } from "@/lib/masks";
import { isValidCPF, isValidPhoneBR, isValidPlate, isValidEmail } from "@/lib/validators";
import { findCoupon, type Coupon } from "@/lib/coupons";
import { computeQuote, type QuoteResult } from "@/lib/quoteCalculator";
import { lookupViaCep } from "@/lib/viaCep";
import { CONTRACT_TEXT } from "@/lib/contractText";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──
interface FormData {
  fullName: string;
  email: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phonePrimary: string;
  phoneSecondary: string;
  platformUsername: string;
  addressCep: string;
  addressUf: string;
  addressCity: string;
  addressNeighborhood: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNote: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  vehicleType: string;
  vehicleFuel: string;
  vehicleColor: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleMaxDays: string;
  remoteBlocking: string;
  installAddressChoice: "same" | "other";
  installCep: string;
  installUf: string;
  installCity: string;
  installNeighborhood: string;
  installStreet: string;
  installNumber: string;
  installComplement: string;
  installNote: string;
  installationPayment: string;
  monthlyPayment: string;
  monthlyDueDay: string;
}

const initialForm: FormData = {
  fullName: "", email: "", cpf: "", rg: "", birthDate: "",
  phonePrimary: "", phoneSecondary: "", platformUsername: "",
  addressCep: "", addressUf: "", addressCity: "", addressNeighborhood: "",
  addressStreet: "", addressNumber: "", addressComplement: "", addressNote: "",
  emergencyName: "", emergencyPhone: "", emergencyRelationship: "",
  vehicleType: "", vehicleFuel: "", vehicleColor: "", vehiclePlate: "",
  vehicleBrand: "", vehicleModel: "", vehicleYear: "", vehicleMaxDays: "",
  remoteBlocking: "",
  installAddressChoice: "same",
  installCep: "", installUf: "", installCity: "", installNeighborhood: "",
  installStreet: "", installNumber: "", installComplement: "", installNote: "",
  installationPayment: "", monthlyPayment: "", monthlyDueDay: "",
};

const VEHICLE_TYPES = [
  { value: "moto", label: "Moto" },
  { value: "carro", label: "Carro" },
  { value: "pickup", label: "Pickup" },
  { value: "caminhonete", label: "Caminhonete" },
  { value: "van", label: "Van" },
  { value: "caminhao", label: "Caminhão" },
  { value: "trator_maquina", label: "Trator / Máquina agrícola" },
  { value: "embarcacao", label: "Embarcação" },
  { value: "aeronave", label: "Aeronave / Helicóptero" },
  { value: "outro", label: "Outro" },
];

const FUEL_OPTIONS = ["Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido", "Outro"];
const COLOR_OPTIONS = ["Amarelo", "Azul", "Bege", "Branco", "Cinza", "Dourado", "Grená", "Laranja", "Marrom", "Prata", "Preto", "Rosa", "Roxo", "Verde", "Vermelha", "Fantasia"];
const MAX_DAYS_OPTIONS = [
  { value: "nenhum_dia", label: "Nenhum dia" },
  { value: "De 1 a 3 dias", label: "De 1 a 3 dias" },
  { value: "De 3 a 5 dias", label: "De 3 a 5 dias" },
  { value: "De 5 a 10 dias", label: "De 5 a 10 dias" },
  { value: "Mais de 10 dias", label: "Mais de 10 dias" },
];

const ContrateFisica = () => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [alertMsg, setAlertMsg] = useState<{ type: "danger" | "warning" | "success" | "info"; text: string } | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  // Periods
  const [periods, setPeriods] = useState({ manha: false, tarde: false, noite: false });
  const anyChecked = periods.manha && periods.tarde && periods.noite;

  // Coupon
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<Coupon | null>(null);
  const [couponAlert, setCouponAlert] = useState<{ type: string; text: string } | null>(null);

  // Contract scroll
  const contractRef = useRef<HTMLDivElement>(null);
  const [contractScrolled, setContractScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Document upload
  const docUpload = useDocumentUpload();

  // Quote
  const quote: QuoteResult = computeQuote(form.vehicleType, form.remoteBlocking, couponApplied);

  // Alert ref for scrolling
  const alertRef = useRef<HTMLDivElement>(null);

  // ── Helpers ──
  const setField = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInvalidFields((prev) => { const n = new Set(prev); n.delete(name); return n; });
  };

  const markInvalid = (field: string) => {
    setInvalidFields((prev) => new Set(prev).add(field));
  };

  const showAlert = (type: "danger" | "warning" | "success" | "info", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const inputCls = (field: string, extra = "") =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm ${invalidFields.has(field) ? "border-red-500" : "border-extra-medium-gray"} ${extra}`;

  const selectCls = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm bg-white ${invalidFields.has(field) ? "border-red-500" : "border-extra-medium-gray"}`;

  // ── ViaCEP ──
  const handleCepBlur = async (scope: "address" | "install") => {
    const cepField = scope === "address" ? "addressCep" : "installCep";
    const cep8 = onlyDigits(form[cepField]).slice(0, 8);
    if (cep8.length !== 8) return;
    if (scope === "install" && form.installAddressChoice === "same") return;

    const data = await lookupViaCep(cep8);
    if (!data) return;

    if (scope === "address") {
      setForm((prev) => ({
        ...prev,
        addressUf: data.uf || prev.addressUf,
        addressCity: data.localidade || prev.addressCity,
        addressNeighborhood: data.bairro || prev.addressNeighborhood,
        addressStreet: data.logradouro || prev.addressStreet,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        installUf: data.uf || prev.installUf,
        installCity: data.localidade || prev.installCity,
        installNeighborhood: data.bairro || prev.installNeighborhood,
        installStreet: data.logradouro || prev.installStreet,
      }));
    }
  };

  // ── Copy address when "same" ──
  useEffect(() => {
    if (form.installAddressChoice === "same") {
      setForm((prev) => ({
        ...prev,
        installCep: prev.addressCep,
        installUf: prev.addressUf,
        installCity: prev.addressCity,
        installNeighborhood: prev.addressNeighborhood,
        installStreet: prev.addressStreet,
        installNumber: prev.addressNumber,
        installComplement: prev.addressComplement,
        installNote: prev.addressNote,
      }));
    }
  }, [
    form.installAddressChoice,
    form.addressCep, form.addressUf, form.addressCity, form.addressNeighborhood,
    form.addressStreet, form.addressNumber, form.addressComplement, form.addressNote,
  ]);

  // ── Contract scroll detection ──
  const handleContractScroll = useCallback(() => {
    const el = contractRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setContractScrolled(true);
  }, []);

  // ── Period toggle ──
  const togglePeriod = (key: "manha" | "tarde" | "noite") => {
    setPeriods((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleAny = () => {
    const newState = !anyChecked;
    setPeriods({ manha: newState, tarde: newState, noite: newState });
  };

  // ── Coupon ──
  const handleApplyCoupon = async () => {
    setCouponAlert(null);
    const raw = couponInput.trim();
    if (!raw) {
      setCouponAlert({ type: "warning", text: "Digite um cupom para aplicar." });
      return;
    }
    const found = await findCoupon(raw);
    if (found) {
      setCouponApplied(found);
      setCouponAlert({ type: "success", text: `Cupom <strong>${found.code}</strong> válido.` });
    } else {
      setCouponApplied(null);
      setCouponAlert({ type: "danger", text: `Cupom <strong>${raw.toUpperCase()}</strong> inválido.` });
    }
  };

  const handleCouponInputChange = (val: string) => {
    setCouponInput(val);
    if (couponApplied && val.trim().toUpperCase() !== couponApplied.code) {
      setCouponApplied(null);
      setCouponAlert(null);
    }
  };

  // ── Validation ──
  const validateAll = (): boolean => {
    setAlertMsg(null);
    setInvalidFields(new Set());

    const fail = (field: string, msg: string) => {
      markInvalid(field);
      showAlert("danger", msg);
      return false;
    };

    // Personal data
    if (!form.fullName.trim()) return fail("fullName", "Preencha seu nome completo.");
    if (!form.email.trim()) return fail("email", "Preencha seu e-mail principal.");
    if (!isValidEmail(form.email)) return fail("email", "Digite um e-mail válido.");
    if (!onlyDigits(form.cpf)) return fail("cpf", "Preencha seu CPF.");
    if (!isValidCPF(form.cpf)) return fail("cpf", "CPF inválido. Verifique e tente novamente.");
    if (!form.rg.trim()) return fail("rg", "Preencha seu RG.");
    if (!form.birthDate) return fail("birthDate", "Informe sua data de nascimento.");
    if (!form.phonePrimary.trim()) return fail("phonePrimary", "Preencha seu celular principal.");
    if (!isValidPhoneBR(form.phonePrimary)) return fail("phonePrimary", "Celular principal inválido.");
    if (!form.phoneSecondary.trim()) return fail("phoneSecondary", "Preencha seu telefone secundário.");
    if (!isValidPhoneBR(form.phoneSecondary)) return fail("phoneSecondary", "Telefone secundário inválido.");
    if (!form.platformUsername.trim()) return fail("platformUsername", "Digite o nome de usuário desejado.");
    if (sanitizeUsername(form.platformUsername).length === 0) return fail("platformUsername", "Nome de usuário inválido.");

    // Document upload
    const docErr = docUpload.validate();
    if (docErr) { showAlert("danger", docErr); return false; }

    // Address
    if (!onlyDigits(form.addressCep)) return fail("addressCep", "Preencha o CEP do endereço de cadastro.");
    if (!form.addressUf.trim()) return fail("addressUf", "Preencha a UF.");
    if (!form.addressCity.trim()) return fail("addressCity", "Preencha a cidade.");
    if (!form.addressNeighborhood.trim()) return fail("addressNeighborhood", "Preencha o bairro.");
    if (!form.addressStreet.trim()) return fail("addressStreet", "Preencha a rua/avenida.");
    if (!form.addressNumber.trim()) return fail("addressNumber", "Preencha o número.");

    // Emergency
    if (!form.emergencyName.trim()) return fail("emergencyName", "Preencha o nome do contato de emergência.");
    if (!form.emergencyPhone.trim()) return fail("emergencyPhone", "Preencha o telefone do contato de emergência.");
    if (!isValidPhoneBR(form.emergencyPhone)) return fail("emergencyPhone", "Telefone do contato de emergência inválido.");
    if (!form.emergencyRelationship.trim()) return fail("emergencyRelationship", "Preencha a relação/parentesco.");

    // Vehicle
    if (!form.vehicleType) return fail("vehicleType", "Selecione o tipo de veículo.");
    if (!form.vehicleFuel) return fail("vehicleFuel", "Selecione o combustível do veículo.");
    if (!form.vehicleColor) return fail("vehicleColor", "Selecione a cor do veículo.");
    if (!form.vehiclePlate.trim()) return fail("vehiclePlate", "Preencha a placa do veículo.");
    if (!isValidPlate(form.vehiclePlate)) return fail("vehiclePlate", "Placa inválida. Use ABC-1234 ou ABC-1D23.");
    if (!form.vehicleBrand.trim()) return fail("vehicleBrand", "Preencha a marca do veículo.");
    if (!form.vehicleModel.trim()) return fail("vehicleModel", "Preencha o modelo do veículo.");
    if (!form.vehicleYear.trim()) return fail("vehicleYear", "Preencha o ano modelo.");
    if (!form.vehicleMaxDays) return fail("vehicleMaxDays", "Selecione o tempo máximo sem uso.");
    if (!form.remoteBlocking) return fail("remoteBlocking", "Selecione se deseja bloqueio remoto.");

    // Install address (only if "other")
    if (form.installAddressChoice === "other") {
      if (!onlyDigits(form.installCep)) return fail("installCep", "Preencha o CEP do endereço de instalação.");
      if (!form.installUf.trim()) return fail("installUf", "Preencha a UF da instalação.");
      if (!form.installCity.trim()) return fail("installCity", "Preencha a cidade da instalação.");
      if (!form.installNeighborhood.trim()) return fail("installNeighborhood", "Preencha o bairro da instalação.");
      if (!form.installStreet.trim()) return fail("installStreet", "Preencha a rua/avenida da instalação.");
      if (!form.installNumber.trim()) return fail("installNumber", "Preencha o número da instalação.");
    }

    // Payment
    if (!periods.manha && !periods.tarde && !periods.noite) {
      showAlert("danger", "Escolha o melhor período para instalação.");
      return false;
    }
    if (!form.installationPayment) return fail("installationPayment", "Selecione a forma de pagamento da instalação.");
    if (!form.monthlyPayment) return fail("monthlyPayment", "Selecione a forma de pagamento da mensalidade.");
    if (!form.monthlyDueDay) return fail("monthlyDueDay", "Selecione o dia de vencimento.");

    // Terms
    if (!termsAccepted) {
      showAlert("danger", "Você deve aceitar o contrato e os termos de uso para continuar.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);

    try {
      // Collect metadata
      let ipAddress = "";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ipAddress = ipData.ip || "";
      } catch { /* ignore */ }

      const userAgent = navigator.userAgent;
      const uaFriendly = (() => {
        const ua = navigator.userAgent;
        let browser = "Navegador desconhecido";
        let os = "SO desconhecido";
        if (ua.includes("Firefox/")) browser = "Firefox";
        else if (ua.includes("Edg/")) browser = "Edge";
        else if (ua.includes("Chrome/")) browser = "Chrome";
        else if (ua.includes("Safari/")) browser = "Safari";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac OS")) os = "macOS";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
        else if (ua.includes("Linux")) os = "Linux";
        return `${browser} — ${os}`;
      })();

      let geolocation = "";
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        geolocation = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
      } catch { /* user denied or timeout */ }

      const collectedAt = new Date().toISOString();

      // Upload documents to storage
      let doc1Url = "";
      let doc1Name = "";
      let doc2Url = "";
      let doc2Name = "";

      const uploadDoc = async (file: File, slot: number) => {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}_${slot}.${ext}`;
        const { data, error } = await supabase.storage.from("documents").upload(path, file);
        if (error) throw new Error(`Erro ao enviar documento: ${error.message}`);
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
        return { url: urlData.publicUrl, name: file.name };
      };

      if (docUpload.doc1) {
        const r = await uploadDoc(docUpload.doc1.file, 1);
        doc1Url = r.url;
        doc1Name = r.name;
      }
      if (docUpload.doc2) {
        const r = await uploadDoc(docUpload.doc2.file, 2);
        doc2Url = r.url;
        doc2Name = r.name;
      }

      // Build periods string
      const periodsArr = [];
      if (periods.manha) periodsArr.push("Manhã");
      if (periods.tarde) periodsArr.push("Tarde");
      if (periods.noite) periodsArr.push("Noite");

      // Coupon description
      let couponDesc = "";
      if (couponApplied) {
        const parts = [];
        if (couponApplied.install_discount_enabled) {
          parts.push(`Instalação: ${couponApplied.install_discount_mode === "percent" ? couponApplied.install_discount_value + "%" : "R$ " + couponApplied.install_discount_value.toFixed(2)} de desconto`);
        }
        if (couponApplied.monthly_discount_enabled) {
          parts.push(`Mensalidade: ${couponApplied.monthly_discount_mode === "percent" ? couponApplied.monthly_discount_value + "%" : "R$ " + couponApplied.monthly_discount_value.toFixed(2)} de desconto`);
        }
        couponDesc = parts.join("; ");
      }

      const submission = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        cpf: form.cpf,
        rg: form.rg.trim(),
        birth_date: form.birthDate,
        phone_primary: form.phonePrimary,
        phone_secondary: form.phoneSecondary,
        platform_username: sanitizeUsername(form.platformUsername),
        address_cep: form.addressCep,
        address_uf: form.addressUf,
        address_city: form.addressCity,
        address_neighborhood: form.addressNeighborhood,
        address_street: form.addressStreet,
        address_number: form.addressNumber,
        address_complement: form.addressComplement,
        address_note: form.addressNote,
        emergency_name: form.emergencyName.trim(),
        emergency_phone: form.emergencyPhone,
        emergency_relationship: form.emergencyRelationship.trim(),
        vehicle_type: form.vehicleType,
        vehicle_fuel: form.vehicleFuel,
        vehicle_color: form.vehicleColor,
        vehicle_plate: form.vehiclePlate.toUpperCase(),
        vehicle_brand: form.vehicleBrand.trim(),
        vehicle_model: form.vehicleModel.trim(),
        vehicle_year: form.vehicleYear.trim(),
        vehicle_max_days: form.vehicleMaxDays,
        remote_blocking: form.remoteBlocking,
        install_address_choice: form.installAddressChoice,
        install_cep: form.installAddressChoice === "same" ? form.addressCep : form.installCep,
        install_uf: form.installAddressChoice === "same" ? form.addressUf : form.installUf,
        install_city: form.installAddressChoice === "same" ? form.addressCity : form.installCity,
        install_neighborhood: form.installAddressChoice === "same" ? form.addressNeighborhood : form.installNeighborhood,
        install_street: form.installAddressChoice === "same" ? form.addressStreet : form.installStreet,
        install_number: form.installAddressChoice === "same" ? form.addressNumber : form.installNumber,
        install_complement: form.installAddressChoice === "same" ? form.addressComplement : form.installComplement,
        install_note: form.installNote,
        install_periods: periodsArr.join(", "),
        installation_payment: form.installationPayment,
        monthly_payment: form.monthlyPayment,
        monthly_due_day: form.monthlyDueDay,
        plan_name: quote.plan,
        monthly_value: quote.monthlyLabel,
        install_value: quote.installLabel,
        coupon_code: couponApplied?.code || null,
        coupon_description: couponDesc || null,
        doc1_url: doc1Url || null,
        doc1_name: doc1Name || null,
        doc2_url: doc2Url || null,
        doc2_name: doc2Name || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        user_agent_friendly: uaFriendly,
        geolocation: geolocation || null,
        collected_at: collectedAt,
        status: "novo",
      };

      // Save to database
      const { error: dbError } = await supabase.from("form_submissions").insert(submission);
      if (dbError) throw new Error(`Erro ao salvar: ${dbError.message}`);

      // Send email via edge function
      try {
        await supabase.functions.invoke("send-form-email", {
          body: { submission },
        });
      } catch (emailErr) {
        console.error("Email sending failed (form was saved):", emailErr);
      }

      showAlert("success", "Formulário enviado com sucesso! Em breve entraremos em contato.");
    } catch (err: any) {
      console.error("Submit error:", err);
      showAlert("danger", err.message || "Erro ao enviar o formulário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render helpers ──
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-full mb-1">
      <h6 className="font-alt text-dark-gray font-bold text-lg">{children}</h6>
    </div>
  );

  const Divider = () => <div className="col-span-full"><span className="block mt-2 mb-6 w-full h-px bg-border" /></div>;

  const CheckboxChoice = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-3 border border-extra-medium-gray rounded-lg px-4 py-3 cursor-pointer hover:border-base-color transition select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-base-color w-4 h-4" />
      <span className="text-sm">{label}</span>
    </label>
  );

  const RadioChoice = ({ label, name, value, checked, onChange }: { label: string; name: string; value: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-3 border border-extra-medium-gray rounded-lg px-4 py-3 cursor-pointer hover:border-base-color transition select-none">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="accent-base-color w-4 h-4" />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <main>
      <PageTitle title="Contrate agora" backgroundImage="/images/title-contato.jpg" />

      <section id="down-section" className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h4 className="font-alt text-dark-gray font-bold text-xl md:text-2xl mb-1">
                    Formulário de contratação<br />(Pessoa física)
                  </h4>
                  <p className="text-sm text-medium-gray">Preencha os dados abaixo para iniciarmos seu cadastro e agendamento de instalação.</p>
                </div>
                <Send className="text-base-color opacity-75 hidden lg:block" size={48} />
              </div>

              {/* Alert */}
              <div ref={alertRef}>
                {alertMsg && (
                  <div className={`mb-6 p-4 rounded-lg text-sm ${
                    alertMsg.type === "danger" ? "bg-red-50 text-red-700 border border-red-200" :
                    alertMsg.type === "warning" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                    alertMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    <div className="flex justify-between items-start">
                      <span dangerouslySetInnerHTML={{ __html: alertMsg.text }} />
                      <button onClick={() => setAlertMsg(null)} className="ml-4 text-lg leading-none">&times;</button>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                  {/* ═══ DADOS PESSOAIS ═══ */}
                  <SectionTitle>Dados pessoais</SectionTitle>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nome completo*</label>
                    <input type="text" placeholder="Nome completo" value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      className={inputCls("fullName")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-mail principal*</label>
                    <input type="email" placeholder="email@exemplo.com" value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={inputCls("email")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CPF*</label>
                    <input type="text" placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                      value={form.cpf}
                      onChange={(e) => setField("cpf", formatCPF(onlyDigits(e.target.value)))}
                      className={inputCls("cpf")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RG*</label>
                    <input type="text" placeholder="00.000.000-0" inputMode="numeric" maxLength={12}
                      value={form.rg}
                      onChange={(e) => setField("rg", e.target.value)}
                      className={inputCls("rg")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de nascimento*</label>
                    <input type="date" value={form.birthDate}
                      onChange={(e) => setField("birthDate", e.target.value)}
                      className={inputCls("birthDate")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Celular principal*</label>
                    <input type="tel" placeholder="(11) 90000-0000" maxLength={15}
                      value={form.phonePrimary}
                      onChange={(e) => setField("phonePrimary", formatPhoneBR(onlyDigits(e.target.value)))}
                      className={inputCls("phonePrimary")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone secundário*</label>
                    <input type="tel" placeholder="(11) 90000-0000" maxLength={15}
                      value={form.phoneSecondary}
                      onChange={(e) => setField("phoneSecondary", formatPhoneBR(onlyDigits(e.target.value)))}
                      className={inputCls("phoneSecondary")} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Nome de usuário na plataforma*</label>
                    <input type="text" placeholder="Ex.: joaosilva" maxLength={30}
                      value={form.platformUsername}
                      onChange={(e) => setField("platformUsername", sanitizeUsername(e.target.value))}
                      className={inputCls("platformUsername", "lowercase")} />
                    <small className="block mt-1 text-medium-gray text-xs">Este será seu login. Sem espaços nem caracteres especiais. Máximo 30 caracteres.</small>
                  </div>

                  {/* ═══ DOCUMENTO ═══ */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Anexe seu documento (RG, CPF ou CNH)*</label>
                    <div className="border border-extra-medium-gray rounded-lg p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Frente */}
                        <div>
                          <button type="button" onClick={() => docUpload.inputRef1.current?.click()}
                            className="bg-base-color text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:opacity-90 transition">
                            Selecionar frente (ou arquivo único)
                          </button>
                          <small className="block mt-2 text-medium-gray">
                            {docUpload.doc1
                              ? `${docUpload.doc1.file.name} (${docUpload.bytesToHuman(docUpload.doc1.file.size)})`
                              : "Nenhum arquivo selecionado."}
                          </small>
                          {docUpload.doc1 && (
                            <div className="relative mt-3">
                              <button type="button" onClick={docUpload.removeFile(1)}
                                className="absolute top-2 right-2 bg-dark-gray text-white text-xs px-3 py-1 rounded z-10">
                                Remover
                              </button>
                              {docUpload.isPdf(docUpload.doc1.file) || docUpload.isHeic(docUpload.doc1.file) ? (
                                <div className="border rounded p-3">
                                  <p className="font-semibold text-sm">{docUpload.isPdf(docUpload.doc1.file) ? "Arquivo PDF" : "Arquivo HEIC/HEIF"}</p>
                                  <a href={docUpload.doc1.previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline mt-2 inline-block">Abrir arquivo</a>
                                </div>
                              ) : (
                                <img src={docUpload.doc1.previewUrl} alt="Prévia do documento" className="max-w-full rounded" />
                              )}
                            </div>
                          )}
                          <input ref={docUpload.inputRef1} type="file" className="hidden"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                            onChange={docUpload.handleFileSelect(1)} />
                        </div>
                        {/* Verso */}
                        <div>
                          <button type="button" onClick={() => docUpload.inputRef2.current?.click()}
                            className="bg-base-color text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:opacity-90 transition">
                            Selecionar verso (opcional)
                          </button>
                          <small className="block mt-2 text-medium-gray">
                            {docUpload.doc2
                              ? `${docUpload.doc2.file.name} (${docUpload.bytesToHuman(docUpload.doc2.file.size)})`
                              : "Nenhum arquivo selecionado."}
                          </small>
                          {docUpload.doc2 && (
                            <div className="relative mt-3">
                              <button type="button" onClick={docUpload.removeFile(2)}
                                className="absolute top-2 right-2 bg-dark-gray text-white text-xs px-3 py-1 rounded z-10">
                                Remover
                              </button>
                              {docUpload.isPdf(docUpload.doc2.file) || docUpload.isHeic(docUpload.doc2.file) ? (
                                <div className="border rounded p-3">
                                  <p className="font-semibold text-sm">{docUpload.isPdf(docUpload.doc2.file) ? "Arquivo PDF" : "Arquivo HEIC/HEIF"}</p>
                                  <a href={docUpload.doc2.previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline mt-2 inline-block">Abrir arquivo</a>
                                </div>
                              ) : (
                                <img src={docUpload.doc2.previewUrl} alt="Prévia do verso" className="max-w-full rounded" />
                              )}
                            </div>
                          )}
                          <input ref={docUpload.inputRef2} type="file" className="hidden"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                            onChange={docUpload.handleFileSelect(2)} />
                        </div>
                      </div>
                      <small className="block mt-3 text-medium-gray">
                        Envie a frente e o verso em <strong>um único arquivo</strong> ou em <strong>2 arquivos</strong>.<br />
                        Formatos: JPG, PNG, WEBP, HEIC/HEIF ou PDF. Máx: 8 MB por arquivo, 16 MB no total.
                      </small>
                    </div>
                  </div>

                  <Divider />

                  {/* ═══ ENDEREÇO DE CADASTRO ═══ */}
                  <SectionTitle>Endereço de cadastro</SectionTitle>

                  <div>
                    <label className="block text-sm font-medium mb-2">CEP*</label>
                    <input type="text" placeholder="00000-000" inputMode="numeric" maxLength={9}
                      value={form.addressCep}
                      onChange={(e) => setField("addressCep", formatCEP(onlyDigits(e.target.value)))}
                      onBlur={() => handleCepBlur("address")}
                      className={inputCls("addressCep")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UF*</label>
                    <input type="text" placeholder="Digite o CEP" readOnly
                      value={form.addressUf}
                      className={inputCls("addressUf", "bg-muted")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cidade*</label>
                    <input type="text" placeholder="Digite o CEP" readOnly
                      value={form.addressCity}
                      className={inputCls("addressCity", "bg-muted")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bairro*</label>
                    <input type="text" placeholder="Bairro"
                      value={form.addressNeighborhood}
                      onChange={(e) => setField("addressNeighborhood", e.target.value)}
                      className={inputCls("addressNeighborhood")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rua/Avenida*</label>
                    <input type="text" placeholder="Rua/Avenida"
                      value={form.addressStreet}
                      onChange={(e) => setField("addressStreet", e.target.value)}
                      className={inputCls("addressStreet")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Número*</label>
                    <input type="text" placeholder="Número" inputMode="numeric"
                      value={form.addressNumber}
                      onChange={(e) => setField("addressNumber", e.target.value)}
                      className={inputCls("addressNumber")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Complemento</label>
                    <input type="text" placeholder="Complemento"
                      value={form.addressComplement}
                      onChange={(e) => setField("addressComplement", e.target.value)}
                      className={inputCls("addressComplement")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Observação</label>
                    <input type="text" placeholder="Observação"
                      value={form.addressNote}
                      onChange={(e) => setField("addressNote", e.target.value)}
                      className={inputCls("addressNote")} />
                  </div>

                  {/* ═══ CONTATO DE EMERGÊNCIA ═══ */}
                  <Divider />
                  <SectionTitle>Contato de emergência</SectionTitle>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nome completo*</label>
                    <input type="text" placeholder="Nome completo"
                      value={form.emergencyName}
                      onChange={(e) => setField("emergencyName", e.target.value)}
                      className={inputCls("emergencyName")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone*</label>
                    <input type="tel" placeholder="(11) 90000-0000" maxLength={15}
                      value={form.emergencyPhone}
                      onChange={(e) => setField("emergencyPhone", formatPhoneBR(onlyDigits(e.target.value)))}
                      className={inputCls("emergencyPhone")} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Relação/parentesco*</label>
                    <input type="text" placeholder="Ex.: Pai, Mãe, Cônjuge..."
                      value={form.emergencyRelationship}
                      onChange={(e) => setField("emergencyRelationship", e.target.value)}
                      className={inputCls("emergencyRelationship")} />
                  </div>

                  {/* ═══ DADOS DO VEÍCULO ═══ */}
                  <Divider />
                  <SectionTitle>Dados do veículo</SectionTitle>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de veículo*</label>
                    <select value={form.vehicleType}
                      onChange={(e) => setField("vehicleType", e.target.value)}
                      className={selectCls("vehicleType")}>
                      <option value="" disabled>Selecione</option>
                      {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Combustível*</label>
                    <select value={form.vehicleFuel}
                      onChange={(e) => setField("vehicleFuel", e.target.value)}
                      className={selectCls("vehicleFuel")}>
                      <option value="" disabled>Selecione</option>
                      {FUEL_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor*</label>
                    <select value={form.vehicleColor}
                      onChange={(e) => setField("vehicleColor", e.target.value)}
                      className={selectCls("vehicleColor")}>
                      <option value="" disabled>Selecione</option>
                      {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Placa* (com hífen)</label>
                    <input type="text" placeholder="ABC-1234 / ABC-1D23" maxLength={8}
                      value={form.vehiclePlate}
                      onChange={(e) => setField("vehiclePlate", formatPlate(e.target.value))}
                      className={inputCls("vehiclePlate", "uppercase")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Marca*</label>
                    <input type="text" placeholder="Ex.: Toyota, Honda..."
                      value={form.vehicleBrand}
                      onChange={(e) => setField("vehicleBrand", e.target.value)}
                      className={inputCls("vehicleBrand")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Modelo*</label>
                    <input type="text" placeholder="Ex.: Corolla, CG 150..."
                      value={form.vehicleModel}
                      onChange={(e) => setField("vehicleModel", e.target.value)}
                      className={inputCls("vehicleModel")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ano modelo*</label>
                    <input type="number" placeholder="Ex.: 2021" min={1950} max={2100}
                      value={form.vehicleYear}
                      onChange={(e) => setField("vehicleYear", e.target.value)}
                      className={inputCls("vehicleYear")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tempo máximo sem uso*</label>
                    <select value={form.vehicleMaxDays}
                      onChange={(e) => setField("vehicleMaxDays", e.target.value)}
                      className={selectCls("vehicleMaxDays")}>
                      <option value="" disabled>Selecione</option>
                      {MAX_DAYS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <small className="block mt-1 text-medium-gray text-xs">Tempo máximo que o veículo fica sem dar partida.</small>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Deseja poder bloquear seu veículo remotamente?*</label>
                    <select value={form.remoteBlocking}
                      onChange={(e) => setField("remoteBlocking", e.target.value)}
                      className={selectCls("remoteBlocking")}>
                      <option value="" disabled>Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>

                  {/* ═══ ENDEREÇO DA INSTALAÇÃO ═══ */}
                  <Divider />
                  <SectionTitle>Endereço da instalação</SectionTitle>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <RadioChoice label="Mesmo endereço de cadastro" name="installChoice" value="same"
                      checked={form.installAddressChoice === "same"}
                      onChange={() => setField("installAddressChoice", "same")} />
                    <RadioChoice label="Outro endereço" name="installChoice" value="other"
                      checked={form.installAddressChoice === "other"}
                      onChange={() => {
                        setField("installAddressChoice", "other");
                        setForm((prev) => ({ ...prev, installCep: "", installUf: "", installCity: "", installNeighborhood: "", installStreet: "", installNumber: "", installComplement: "", installNote: "" }));
                      }} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CEP (instalação)*</label>
                    <input type="text" placeholder="00000-000" inputMode="numeric" maxLength={9}
                      value={form.installCep}
                      onChange={(e) => setField("installCep", formatCEP(onlyDigits(e.target.value)))}
                      onBlur={() => handleCepBlur("install")}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installCep", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UF (instalação)*</label>
                    <input type="text" placeholder="Digite o CEP" readOnly
                      value={form.installUf}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installUf", "bg-muted opacity-60")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cidade (instalação)*</label>
                    <input type="text" placeholder="Digite o CEP" readOnly
                      value={form.installCity}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installCity", "bg-muted opacity-60")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bairro (instalação)*</label>
                    <input type="text" placeholder="Bairro"
                      value={form.installNeighborhood}
                      onChange={(e) => setField("installNeighborhood", e.target.value)}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installNeighborhood", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rua/Avenida (instalação)*</label>
                    <input type="text" placeholder="Rua/Avenida"
                      value={form.installStreet}
                      onChange={(e) => setField("installStreet", e.target.value)}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installStreet", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Número (instalação)*</label>
                    <input type="text" placeholder="Número" inputMode="numeric"
                      value={form.installNumber}
                      onChange={(e) => setField("installNumber", e.target.value)}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installNumber", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Complemento (instalação)</label>
                    <input type="text" placeholder="Complemento"
                      value={form.installComplement}
                      onChange={(e) => setField("installComplement", e.target.value)}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installComplement", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Observação (instalação)</label>
                    <input type="text" placeholder="Observação"
                      value={form.installNote}
                      onChange={(e) => setField("installNote", e.target.value)}
                      disabled={form.installAddressChoice === "same"}
                      className={inputCls("installNote", form.installAddressChoice === "same" ? "bg-muted opacity-60" : "")} />
                  </div>

                  {/* ═══ INSTALAÇÃO E PAGAMENTOS ═══ */}
                  <Divider />
                  <SectionTitle>Instalação e pagamentos</SectionTitle>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-3">Melhor período para instalação?*</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <CheckboxChoice label="Manhã" checked={periods.manha} onChange={() => togglePeriod("manha")} />
                      <CheckboxChoice label="Tarde" checked={periods.tarde} onChange={() => togglePeriod("tarde")} />
                      <CheckboxChoice label="Noite" checked={periods.noite} onChange={() => togglePeriod("noite")} />
                      <CheckboxChoice label="Qualquer horário" checked={anyChecked} onChange={toggleAny} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pagamento da instalação*</label>
                    <select value={form.installationPayment}
                      onChange={(e) => setField("installationPayment", e.target.value)}
                      className={selectCls("installationPayment")}>
                      <option value="" disabled>Selecione</option>
                      <option value="Cartão de crédito">Cartão de crédito</option>
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pagamento da mensalidade*</label>
                    <select value={form.monthlyPayment}
                      onChange={(e) => setField("monthlyPayment", e.target.value)}
                      className={selectCls("monthlyPayment")}>
                      <option value="" disabled>Selecione</option>
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dia de vencimento*</label>
                    <select value={form.monthlyDueDay}
                      onChange={(e) => setField("monthlyDueDay", e.target.value)}
                      className={selectCls("monthlyDueDay")}>
                      <option value="" disabled>Selecione</option>
                      <option value="10">Dia 10</option>
                      <option value="15">Dia 15</option>
                      <option value="20">Dia 20</option>
                    </select>
                  </div>

                  {/* ═══ CUPOM ═══ */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Cupom de desconto/indicação (opcional):</label>
                    <CheckboxChoice
                      label="Marque aqui caso tenha um cupom de desconto/indicação"
                      checked={hasCoupon}
                      onChange={() => {
                        setHasCoupon(!hasCoupon);
                        if (hasCoupon) {
                          setCouponInput("");
                          setCouponApplied(null);
                          setCouponAlert(null);
                        }
                      }}
                    />
                    <small className="block text-medium-gray text-xs mt-2">Se você não tem cupom, deixe desmarcado.</small>

                    {hasCoupon && (
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input type="text" placeholder="Digite aqui e clique em APLICAR" value={couponInput}
                            onChange={(e) => handleCouponInputChange(e.target.value)}
                            className="flex-1 px-4 py-3 border border-extra-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm" />
                          <button type="button" onClick={handleApplyCoupon}
                            className="bg-base-color text-white px-6 py-3 rounded-full text-sm font-medium shadow hover:opacity-90 transition whitespace-nowrap">
                            Aplicar
                          </button>
                        </div>
                        {couponAlert && (
                          <div className={`mt-3 p-3 rounded-lg text-sm ${
                            couponAlert.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                            couponAlert.type === "warning" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                            "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            <span dangerouslySetInnerHTML={{ __html: couponAlert.text }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ═══ RESUMO DO PEDIDO ═══ */}
                  <Divider />
                  <div className="md:col-span-2">
                    <div className="border border-extra-medium-gray rounded-lg p-5 bg-muted">
                      <span className="font-alt text-dark-gray font-bold block">Resumo do pedido</span>
                      <small className="block text-medium-gray">(Atualiza automaticamente conforme suas escolhas.)</small>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm text-dark-gray"><strong>Plano:</strong> {quote.plan}</p>
                        <p className="text-sm text-dark-gray"><strong>Mensalidade:</strong> {quote.monthlyLabel}</p>
                        <p className="text-sm text-dark-gray"><strong>Instalação:</strong> {quote.installLabel}</p>
                        {quote.couponLine && (
                          <p className="text-sm text-dark-gray mt-2">
                            <strong>Cupom:</strong> <span dangerouslySetInnerHTML={{ __html: quote.couponLine }} />
                          </p>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <small className="block text-medium-gray">
                          Motos, carros, pickups, vans e caminhonetes:<br />
                          <strong>R$ 58,90/mês</strong> – sem bloqueio (GuardianEssential)<br />
                          <strong>R$ 64,90/mês</strong> – com bloqueio via app (GuardianSecure)<br />
                          Instalação: <strong>R$ 120,00</strong>
                        </small>
                        <small className="block text-medium-gray">
                          Caminhões, tratores, máquinas, embarcações e aeronaves:<br />
                          <strong>R$ 68,90/mês</strong> – com ou sem bloqueio (GuardianHeavy)<br />
                          Instalação: <strong>a partir de R$ 150,00</strong>
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* ═══ CONTRATO ═══ */}
                  <Divider />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-3">CONTRATO DE PRESTAÇÃO DE SERVIÇO*</label>
                    <div ref={contractRef} onScroll={handleContractScroll}
                      className="border border-extra-medium-gray rounded-lg p-5 max-h-64 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap text-medium-gray mb-4">
                      {CONTRACT_TEXT}
                    </div>

                    <label className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition select-none ${
                      !contractScrolled ? "opacity-50 border-extra-medium-gray" : "border-extra-medium-gray hover:border-base-color"
                    }`}>
                      <input type="checkbox" checked={termsAccepted}
                        disabled={!contractScrolled}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="accent-base-color w-4 h-4" />
                      <span className="text-sm">
                        Li integralmente e concordo com o <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇO</strong>
                      </span>
                    </label>
                    {!contractScrolled && (
                      <small className="block text-medium-gray text-xs mt-2">
                        Role o contrato até o final para habilitar o aceite.
                      </small>
                    )}
                  </div>

                  {/* ═══ SUBMIT ═══ */}
                  {/* Collected data display */}
                  <div className="md:col-span-2 mt-2">
                    <small className="block text-medium-gray text-xs leading-relaxed">
                      <strong>Dados coletados:</strong>{" "}
                      IP: <span id="gtCollectedIp">Carregando...</span> — 
                      Navegador/SO: <span id="gtCollectedAgent">{(() => {
                        const ua = navigator.userAgent;
                        let browser = "Desconhecido";
                        let os = "Desconhecido";
                        if (ua.includes("Firefox/")) browser = "Firefox";
                        else if (ua.includes("Edg/")) browser = "Edge";
                        else if (ua.includes("Chrome/")) browser = "Chrome";
                        else if (ua.includes("Safari/")) browser = "Safari";
                        if (ua.includes("Windows")) os = "Windows";
                        else if (ua.includes("Mac OS")) os = "macOS";
                        else if (ua.includes("Android")) os = "Android";
                        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
                        else if (ua.includes("Linux")) os = "Linux";
                        return `${browser} — ${os}`;
                      })()}</span> — 
                      Data/Hora: {new Date().toLocaleString("pt-BR")}
                    </small>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
                      <p className="text-xs text-medium-gray text-center md:text-left">
                        Ao enviar, você confirma a contratação e autoriza contato para agendamento. Dados tratados conforme a{" "}
                        <a href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd" target="_blank" rel="noreferrer" className="underline">LGPD</a>.
                      </p>
                      <button type="submit" disabled={submitting}
                        className="bg-base-color text-white px-8 py-3 rounded-full font-medium shadow hover:opacity-90 transition text-sm whitespace-nowrap disabled:opacity-60 flex items-center gap-2">
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        {submitting ? "Enviando..." : "Enviar solicitação"}
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default ContrateFisica;

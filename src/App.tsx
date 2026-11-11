import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  CreditCard,
  Send,
  Home,
  Menu,
  ShieldCheck,
  User,
  Plus,
  Share2,
  Heart,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Info,
  Power,
  ArrowRight,
  Rocket,
  QrCode,
  Umbrella,
  Phone,
  Settings,
  Coins,
  Sprout,
  Fingerprint,
  MapPin,
  Download
} from 'lucide-react';

// Types
interface VirementTraite {
  id: string;
  beneficiaire: string;
  nomComplet: string;
  date: string;
  montant: string;
  statut: 'Exécuté';
  type: 'standard' | 'instant';
  mois: string;
  rib: string;
  motif?: string;
  compteEmetteur?: string;
}

interface VirementPlanifie {
  id: string;
  beneficiaire: string;
  date: string;
  montant: string;
  statut: 'En cours de traitement';
  mois: string;
  rib: string;
  motif: string;
  compteEmetteur: string;
}

interface Beneficiaire {
  nom: string;
  rib: string;
  initials: string;
  color: string;
  dateAjout: string;
  badgeType?: 'attijari' | 'other';
  hasFeather?: boolean;
}

interface OperationAccueil {
  id: string;
  titreCourt: string;
  titreComplet: string;
  date: string;
  montant: string;
  compte: string;
  isDebit?: boolean;
  mois?: string;
}

export default function App() {
  // App navigation state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comptes' | 'transactions-pro' | 'cartes' | 'virements' | 'services' | 'menu' | 'detail-operation'>('dashboard');
  const [previousTab, setPreviousTab] = useState<'dashboard' | 'transactions-pro'>('dashboard');
  const [virementView, setVirementView] = useState<'etape1' | 'etape2' | 'etape3' | 'etape4' | 'secure' | 'succes' | 'beneficiaires' | 'ajouter-beneficiaire' | 'mes-virements' | 'detail-virement' | 'otp'>('etape1');
  const [mesVirementsSubTab, setMesVirementsSubTab] = useState<'traites' | 'planif' | 'perm'>('traites');
  const [cartesSubTab, setCartesSubTab] = useState<'physiques' | 'virtuelles'>('physiques');
  const [selectedOperation, setSelectedOperation] = useState<OperationAccueil | null>(null);

  // OTP state (SMS Confirmation)
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpFlow, setOtpFlow] = useState<'virement' | 'beneficiaire' | null>(null);
  const [otpReturnView, setOtpReturnView] = useState<'etape4' | 'ajouter-beneficiaire' | 'beneficiaires' | 'etape1'>('etape1');
  const [pendingBeneficiaire, setPendingBeneficiaire] = useState<Beneficiaire | null>(null);
  
  // Modals & UI states
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);
  const [isMaskedSoldes, setIsMaskedSoldes] = useState(false);
  const [isChoixCompteOpen, setIsChoixCompteOpen] = useState(false);
  const [showSecureBanner, setShowSecureBanner] = useState(true);
  const [paiementsSubmenuOpen, setPaiementsSubmenuOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchProQuery, setSearchProQuery] = useState('');
  const [showProSearchBar, setShowProSearchBar] = useState(false);
  const [filterProType, setFilterProType] = useState<'all' | 'credit' | 'debit'>('all');
  const [showFilterPro, setShowFilterPro] = useState(false);
  const [showAccountMenuPro, setShowAccountMenuPro] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showSecureCard, setShowSecureCard] = useState(true);
  const [showAppareilsCard, setShowAppareilsCard] = useState(true);
  const [promoModal, setPromoModal] = useState<{ title: string; subtitle: string; content: string } | null>(null);
  const [searchBeneficiaireQuery, setSearchBeneficiaireQuery] = useState('');
  const [showSearchBeneficiaire, setShowSearchBeneficiaire] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Menu tab states
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuConsultationOpen, setMenuConsultationOpen] = useState(false);
  const [menuPaiementsOpen, setMenuPaiementsOpen] = useState(false);
  const [menuEpargneOpen, setMenuEpargneOpen] = useState(false);
  const [showRibModal, setShowRibModal] = useState(false);

  // Virement form state
  const [selectedCompteEmetteur, setSelectedCompteEmetteur] = useState<{
    id: 'compte-pro' | 'compte-cheque';
    title: string;
    rib: string;
    solde: string;
  }>({
    id: 'compte-cheque',
    title: 'Compte chèque',
    rib: '000713N300400592',
    solde: '3 252,54 MAD',
  });

  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | null>(null);

  const [montantVirement, setMontantVirement] = useState('1,00');
  const [motifVirement, setMotifVirement] = useState('');
  const [typeOrdre, setTypeOrdre] = useState<'simple' | 'permanent'>('simple');
  const [dateExecution, setDateExecution] = useState('14/10/2026');
  const [currentPin, setCurrentPin] = useState('');

  // Detail view state for operations & virements
  const [detailOperation, setDetailOperation] = useState<{
    titre: string;
    montant: string;
    date: string;
    isPositive: boolean;
    ribBeneficiaire?: string;
  } | null>(null);

  const [detailVirement, setDetailVirement] = useState<{
    montant: string;
    beneficiaire: string;
    emetteur: string;
    compteEmetteur: string;
    rib: string;
    statut: string;
    statutColor: string;
    dateInitiation: string;
    dateExecution: string;
    motif: string;
  } | null>({
    montant: '100,00 DH',
    beneficiaire: 'ABDERRAHIM M ABALLAGH',
    emetteur: 'M ABALLAGH SABER',
    compteEmetteur: '000713N300400592',
    rib: '007450000713330040278206',
    statut: 'Exécuté',
    statutColor: 'text-green-600',
    dateInitiation: '29/10/2026',
    dateExecution: '29/10/2026',
    motif: 'Virement ponctuel',
  });

  // Liste des Dernières Opérations de l'Accueil selon les captures
  const operationsAccueil: OperationAccueil[] = [
    {
      id: 'op-1',
      titreCourt: 'Virement effectué ...',
      titreComplet: 'Virement effectué par M. Memphis Doku',
      date: '17 oct. 2026',
      montant: '+ 3 833,62 MAD',
      compte: '000713N300400592',
    },
    {
      id: 'op-2',
      titreCourt: 'SMMCPAN',
      titreComplet: 'SMMCPAN',
      date: '14 oct. 2026',
      montant: '+ 3 888,29 MAD',
      compte: '000713N300400592',
    },
    {
      id: 'op-3',
      titreCourt: 'Virement mensuel...',
      titreComplet: 'Virement mensuel #3 reçu de DEVMEM S.A',
      date: '13 oct. 2026',
      montant: '+ 16 484,10 MAD',
      compte: '000713N300400592',
    },
    {
      id: 'op-4',
      titreCourt: 'Fiverr commission',
      titreComplet: 'Fiverr commission',
      date: '01 oct. 2026',
      montant: '+ 13 206,80 MAD',
      compte: '000713N300400592',
    },
    {
      id: 'op-5',
      titreCourt: 'Virement mensuel...',
      titreComplet: 'Virement mensuel #3 reçu de DEVMEM S.A',
      date: '13 sep. 2026',
      montant: '+ 16 071,45 MAD',
      compte: '000713N300400592',
    },
  ];

  // Historique des opérations du Compte Professionnel (exactement comme dans les 16 captures)
  const operationsProData: OperationAccueil[] = [
    // Octobre 2026
    {
      id: 'pro-1',
      titreCourt: 'SMMCPAN',
      titreComplet: 'SMMCPAN',
      date: '31 oct. 2026',
      montant: '+ 4 322,34 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-2',
      titreCourt: 'Virement effectu...',
      titreComplet: 'Virement effectué par M. Memphis Doku',
      date: '17 oct. 2026',
      montant: '+ 3 833,62 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-3',
      titreCourt: 'ASSURANCE ATTI...',
      titreComplet: 'ASSURANCE ATTIJARIWAFA BANK',
      date: '16 oct. 2026',
      montant: '- 233,50 MAD',
      isDebit: true,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-4',
      titreCourt: 'SMMCPAN',
      titreComplet: 'SMMCPAN',
      date: '14 oct. 2026',
      montant: '+ 3 888,29 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-5',
      titreCourt: 'Virement mens...',
      titreComplet: 'Virement mensuel #4 reçu de la part de DEVMEM S.A',
      date: '13 oct. 2026',
      montant: '+ 16 484,10 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-6',
      titreCourt: 'VIR. WEB RECU ...',
      titreComplet: 'VIR. WEB RECU DE ABALLAGH',
      date: '10 oct. 2026',
      montant: '+ 3 850,00 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-7',
      titreCourt: 'HOSTINGER HEB...',
      titreComplet: 'HOSTINGER HEBERGEMENT',
      date: '10 oct. 2026',
      montant: '- 3 843,39 MAD',
      isDebit: true,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-8',
      titreCourt: 'Virement effectu...',
      titreComplet: 'Virement effectué par M. Memphis Doku',
      date: '09 oct. 2026',
      montant: '+ 3 852,10 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-9',
      titreCourt: 'Fiverr commiss...',
      titreComplet: 'Fiverr commission',
      date: '01 oct. 2026',
      montant: '+ 13 206,80 MAD',
      isDebit: false,
      mois: 'Octobre 2026',
      compte: '000713N300400592',
    },
    // Septembre 2026
    {
      id: 'pro-10',
      titreCourt: 'Virement mens...',
      titreComplet: 'Virement mensuel #3 reçu de la part de DEVMEM S.A',
      date: '13 sep. 2026',
      montant: '+ 16 071,45 MAD',
      isDebit: false,
      mois: 'Septembre 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-11',
      titreCourt: 'Fiverr commiss...',
      titreComplet: 'Fiverr commission',
      date: '01 sep. 2026',
      montant: '+ 26 961,70 MAD',
      isDebit: false,
      mois: 'Septembre 2026',
      compte: '000713N300400592',
    },
    // Août 2026
    {
      id: 'pro-12',
      titreCourt: 'Virement mens...',
      titreComplet: 'Virement mensuel #2 reçu de la part de DEVMEM S.A',
      date: '13 août 2026',
      montant: '+ 16 071,45 MAD',
      isDebit: false,
      mois: 'Août 2026',
      compte: '000713N300400592',
    },
    {
      id: 'pro-13',
      titreCourt: 'Recharge effect...',
      titreComplet: 'Recharge effectuée par Memphis Doku',
      date: '13 août 2026',
      montant: '+ 3 602,77 MAD',
      isDebit: false,
      mois: 'Août 2026',
      compte: '000713N300400592',
    },
  ];

  // Liste des virements traités EXACTEMENT telle que fournie dans les captures
  const virementsTraitesData: VirementTraite[] = [
    // Octobre 2026
    {
      id: 'vt-1',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '29/10/2026',
      montant: '100,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Octobre 2026',
      rib: '007450000713330040278206',
      motif: 'Virement ponctuel',
    },
    // Septembre 2026
    {
      id: 'vt-2',
      beneficiaire: 'ABDERRAHIM M ABALL...',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '12/09/2026',
      montant: '1 000,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Septembre 2026',
      rib: '007450000713330040278206',
      motif: 'Avance sur prestation',
    },
    // Août 2026
    {
      id: 'vt-3',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '04/08/2026',
      montant: '150,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Août 2026',
      rib: '007450000713330040278206',
      motif: 'Remboursement frais',
    },
    // Juillet 2026
    {
      id: 'vt-4',
      beneficiaire: 'ABDERRAHIM M ABALL...',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '06/07/2026',
      montant: '3 000,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juillet 2026',
      rib: '007450000713330040278206',
      motif: 'Paiement mensuel',
    },
    // Juin 2026
    {
      id: 'vt-5',
      beneficiaire: 'Abdelmourhith Sadki',
      nomComplet: 'Abdelmourhith Sadki',
      date: '28/06/2026',
      montant: '500,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juin 2026',
      rib: '011780000012300000984321',
      motif: 'Prestation de service',
    },
    {
      id: 'vt-6',
      beneficiaire: 'ABDERRAHIM M ABALL...',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '25/06/2026',
      montant: '3 000,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juin 2026',
      rib: '007450000713330040278206',
      motif: 'Facture #2490',
    },
    {
      id: 'vt-7',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '22/06/2026',
      montant: '500,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juin 2026',
      rib: '007450000713330040278206',
      motif: 'Frais de transport',
    },
    {
      id: 'vt-8',
      beneficiaire: 'ABDERRAHIM M ABALL...',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '19/06/2026',
      montant: '1 000,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juin 2026',
      rib: '007450000713330040278206',
      motif: 'Acompte travaux',
    },
    {
      id: 'vt-9',
      beneficiaire: 'CHAKIR KALTOUM',
      nomComplet: 'CHAKIR KALTOUM',
      date: '18/06/2026',
      montant: '1 000,00 DH',
      statut: 'Exécuté',
      type: 'instant', // Instantané avec icône chronomètre / chrono
      mois: 'Juin 2026',
      rib: '011450000009200000863260',
      motif: 'Virement instantané',
    },
    {
      id: 'vt-10',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '13/06/2026',
      montant: '200,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Juin 2026',
      rib: '007450000713330040278206',
      motif: 'Dépannage',
    },
    // Mai 2026
    {
      id: 'vt-11',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '26/05/2026',
      montant: '800,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Mai 2026',
      rib: '007450000713330040278206',
      motif: 'Règlement matériel',
    },
    {
      id: 'vt-12',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '23/05/2026',
      montant: '500,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Mai 2026',
      rib: '007450000713330040278206',
      motif: 'Paiement partiel',
    },
    {
      id: 'vt-13',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '23/05/2026',
      montant: '300,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Mai 2026',
      rib: '007450000713330040278206',
      motif: 'Complément',
    },
    {
      id: 'vt-14',
      beneficiaire: 'CHAKIR KALTOUM',
      nomComplet: 'CHAKIR KALTOUM',
      date: '15/05/2026',
      montant: '1 000,00 DH',
      statut: 'Exécuté',
      type: 'instant', // Instantané avec icône chronomètre / chrono
      mois: 'Mai 2026',
      rib: '011450000009200000863260',
      motif: 'Virement instantané express',
    },
    // Avril 2026
    {
      id: 'vt-15',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '29/04/2026',
      montant: '600,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Avril 2026',
      rib: '007450000713330040278206',
      motif: 'Honoraires avril',
    },
    {
      id: 'vt-16',
      beneficiaire: 'ABDERRAHIM M ABALL...',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '06/04/2026',
      montant: '3 000,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Avril 2026',
      rib: '007450000713330040278206',
      motif: 'Contrat mensuel',
    },
    // Mars 2026
    {
      id: 'vt-17',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '07/03/2026',
      montant: '400,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Mars 2026',
      rib: '007450000713330040278206',
      motif: 'Remboursement divers',
    },
    // Février 2026
    {
      id: 'vt-18',
      beneficiaire: 'ABDERRAHIM M ABALLAGH',
      nomComplet: 'ABDERRAHIM M ABALLAGH',
      date: '08/02/2026',
      montant: '100,00 DH',
      statut: 'Exécuté',
      type: 'standard',
      mois: 'Février 2026',
      rib: '007450000713330040278206',
      motif: 'Test virement Attijari',
    },
  ];

  // Virements planifiés
  const virementsPlanifiesData: VirementPlanifie[] = [
    {
      id: 'vp-1',
      beneficiaire: 'ABALLAGH ABDERRAHIM',
      date: '09/11/2026',
      montant: '50 000,00 DH',
      statut: 'En cours de traitement',
      mois: 'Novembre 2026',
      rib: '007450000713330040278206',
      motif: "Remboursement d'une dette",
      compteEmetteur: '000713N300400592',
    },
  ];

  // Liste des bénéficiaires
  const [beneficiairesList, setBeneficiairesList] = useState<Beneficiaire[]>([
    {
      nom: 'YOUSSEF  AIT OUFKIR SAID',
      rib: '007450000713200030618807',
      initials: 'Y',
      color: 'bg-[#0284c7]',
      dateAjout: '03 oct. 2024',
      badgeType: 'attijari',
    },
    {
      nom: 'WAHBI AMMAR',
      rib: '007240000987500030146154',
      initials: 'WA',
      color: 'bg-[#6b21a8]',
      dateAjout: '16 nov. 2025',
      badgeType: 'attijari',
    },
    {
      nom: 'Mohamed Allam',
      rib: '230450606031621101750032',
      initials: 'MA',
      color: 'bg-[#0096e6]',
      dateAjout: '05 août 2025',
      badgeType: 'other',
    },
    {
      nom: 'NAOUFAL BENTALEB',
      rib: '007450000713500030329441',
      initials: 'NB',
      color: 'bg-[#0f766e]',
      dateAjout: '25 oct. 2024',
      badgeType: 'attijari',
    },
    {
      nom: 'Mouhssine Belaicha',
      rib: '230450466740221101750002',
      initials: 'MB',
      color: 'bg-[#06b6d4]',
      dateAjout: '27 juin 2026',
      badgeType: 'other',
    },
    {
      nom: 'ABDERRAHIM M ABALLAGH',
      rib: '007450000713330040278206',
      initials: 'AM',
      color: 'bg-[#0284c7]',
      dateAjout: '08 févr. 2026',
      badgeType: 'attijari',
    },
    {
      nom: 'OUFKIR SAID YOUSSEF M AIT',
      rib: '007450000713530040234934',
      initials: 'OS',
      color: 'bg-[#e11d48]',
      dateAjout: '19 mai 2025',
      badgeType: 'attijari',
    },
    {
      nom: 'Mohamed Malih',
      rib: '007010000501900030087114',
      initials: 'M..',
      color: 'bg-[#6d28d9]',
      dateAjout: '05 avr. 2026',
      badgeType: 'attijari',
    },
    {
      nom: 'EDDALLAL mohamed',
      rib: '230450647785521101750068',
      initials: 'EM',
      color: 'bg-[#F08B00]',
      dateAjout: '23 oct. 2026',
      badgeType: 'other',
    },
    {
      nom: 'El aarabi Hassan',
      rib: '011794000070200000488542',
      initials: 'EA',
      color: 'bg-[#00a884]',
      dateAjout: '02 avr. 2026',
      badgeType: 'other',
    },
    {
      nom: 'CHAKIR KALTOUM',
      rib: '011450000009200000863260',
      initials: 'CK',
      color: 'bg-[#0096e6]',
      dateAjout: '15 mai 2026',
      badgeType: 'other',
    },
  ]);

  // Nouveau bénéficiaire formulaire
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauPrenom, setNouveauPrenom] = useState('');
  const [nouveauRib, setNouveauRib] = useState('');

  // Helper simulated loading
  const executeWithLoading = (action: () => void, duration = 800) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      action();
    }, duration);
  };

  // Switch tabs
  const handleTabSwitch = (tab: typeof activeTab) => {
    executeWithLoading(() => {
      setActiveTab(tab);
      if (tab === 'virements') {
        setVirementView('mes-virements');
      }
      setIsMobileMenuOpen(false);
    }, 500);
  };

  // Login handler: password Simo123@ or biometric fingerprint, with 5 seconds loading overlay
  const handlePerformLogin = (isBiometric = false) => {
    // Remplir automatiquement le mot de passe Simo123@ si vide
    if (!password) {
      setPassword('Simo123@');
    }
    setLoginError('');
    setIsAuthenticating(true);

    // Minuterie de 5 secondes exactement comme demandé, puis entrée dans l'appli
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    }, 5000);
  };

  // Ecoute de l'événement PWA avant installation sur Android
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerInstall = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        setDeferredInstallPrompt(null);
      });
    } else {
      setShowInstallModal(true);
    }
  };

  // Switch virement subviews with loading
  const handleVirementViewSwitch = (view: typeof virementView) => {
    executeWithLoading(() => {
      setVirementView(view);
    }, 500);
  };

  // Validation OTP SMS avec vérification (si n'importe quel code, affiche que le code est erroné)
  const handleValidateOtp = () => {
    if (!otpCode.trim()) {
      setOtpError('Veuillez saisir le code reçu par SMS.');
      return;
    }
    // Si le code est 2546 (les 4 chiffres affichés du numéro de téléphone *******2546) : valide avec succès
    if (otpCode.trim() === '2546') {
      setOtpError('');
      executeWithLoading(() => {
        if (otpFlow === 'beneficiaire' && pendingBeneficiaire) {
          setBeneficiairesList((prev) => [pendingBeneficiaire, ...prev]);
          setSelectedBeneficiaire(pendingBeneficiaire);
          setNouveauNom('');
          setNouveauPrenom('');
          setNouveauRib('');
          setPendingBeneficiaire(null);
          setVirementView('beneficiaires');
        } else {
          setVirementView('succes');
        }
        setOtpCode('');
      }, 1000);
    } else {
      // Si n'importe quel autre code est entré : affiche code erroné
      setOtpError('Code erroné, veuillez réessayer.');
    }
  };

  // Open detail for a virement in Traités
  const handleOpenDetailTraite = (item: VirementTraite) => {
    setDetailVirement({
      montant: item.montant,
      beneficiaire: item.nomComplet,
      emetteur: 'M ABALLAGH SABER',
      compteEmetteur: '000713N300400592',
      rib: item.rib,
      statut: 'Exécuté',
      statutColor: 'text-green-600',
      dateInitiation: item.date,
      dateExecution: item.date,
      motif: item.motif || 'Virement ponctuel',
    });
    executeWithLoading(() => {
      setVirementView('detail-virement');
    }, 400);
  };

  // Open detail for a planifié
  const handleOpenDetailPlanifie = (item: VirementPlanifie) => {
    setDetailVirement({
      montant: item.montant,
      beneficiaire: item.beneficiaire,
      emetteur: 'M ABALLAGH SABER',
      compteEmetteur: item.compteEmetteur,
      rib: item.rib,
      statut: item.statut,
      statutColor: 'text-amber-600',
      dateInitiation: item.date,
      dateExecution: item.date,
      motif: item.motif,
    });
    executeWithLoading(() => {
      setVirementView('detail-virement');
    }, 400);
  };

  // PIN keypad helper
  const handlePinAppend = (num: string) => {
    if (currentPin.length < 6) {
      setCurrentPin((prev) => prev + num);
    }
  };

  const handlePinDelete = () => {
    setCurrentPin((prev) => prev.slice(0, -1));
  };

  const handleConfirmPin = () => {
    if (currentPin.length === 6) {
      executeWithLoading(() => {
        setVirementView('succes');
      }, 1000);
    } else {
      alert('Veuillez saisir les 6 chiffres de votre code PIN.');
    }
  };

  // Filter virements
  const filteredVirementsTraites = virementsTraitesData.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.beneficiaire.toLowerCase().includes(q) ||
      v.nomComplet.toLowerCase().includes(q) ||
      v.date.toLowerCase().includes(q) ||
      v.montant.toLowerCase().includes(q) ||
      v.mois.toLowerCase().includes(q)
    );
  });

  // Group filtered virements by month
  const groupedVirements: { [key: string]: VirementTraite[] } = {};
  filteredVirementsTraites.forEach((v) => {
    if (!groupedVirements[v.mois]) {
      groupedVirements[v.mois] = [];
    }
    groupedVirements[v.mois].push(v);
  });

  // Render transfer icon component (standard vs instant transfer with speed clock)
  const renderVirementIcon = (type: 'standard' | 'instant') => {
    if (type === 'instant') {
      return (
        <div className="w-10 h-10 rounded-full bg-[#84c5d6] text-white flex items-center justify-center shrink-0 shadow-sm relative">
          {/* Instant stopwatch / speed transfer icon */}
          <div className="flex items-center space-x-0.5">
            <div className="flex flex-col space-y-[2px] pr-0.5">
              <span className="w-1.5 h-[1.8px] bg-white rounded-full"></span>
              <span className="w-2.5 h-[1.8px] bg-white rounded-full"></span>
              <span className="w-1.5 h-[1.8px] bg-white rounded-full"></span>
            </div>
            <Clock className="w-4 h-4 text-white stroke-[2.4]" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-[#84c5d6] text-white flex items-center justify-center shrink-0 shadow-sm">
        {/* Opposing horizontal arrows icon */}
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 8H5" />
          <path d="M9 4L5 8l4 4" />
          <path d="M5 16h14" />
          <path d="M15 12l4 4-4 4" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden text-gray-800">
      {/* POP-UP DE CHARGEMENT GLOBAL */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
          <div className="bg-white rounded-3xl py-8 px-10 shadow-2xl flex flex-col items-center justify-center min-w-[220px] mx-4 animate-in fade-in zoom-in duration-200">
            <svg className="w-10 h-10 text-[#eb5545] mb-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 3a9 9 0 0 1 9 9" />
            </svg>
            <span className="text-base font-extrabold text-gray-900 tracking-tight">Chargement ...</span>
          </div>
        </div>
      )}

      {/* PAGE DE CONNEXION INITIALE (Reproduction exacte de la capture Attijari Mobile) */}
      {!isLoggedIn && (
        <div
          className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col justify-between items-center overflow-y-auto"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 10 L40 20 L60 30 L80 20' fill='none' stroke='%2394a3b8' stroke-width='1.2' opacity='0.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M0 0 L20 -10 L40 0 L60 10 L80 0' fill='none' stroke='%2394a3b8' stroke-width='1.2' opacity='0.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M0 40 L20 30 L40 40 L60 50 L80 40' fill='none' stroke='%2394a3b8' stroke-width='1.2' opacity='0.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        >
          {/* Contenu principal centré */}
          <div className="w-full max-w-[390px] px-4 pt-8 pb-4 flex flex-col items-center my-auto">
            {/* Logo officiel Attijariwafa bank exact de la capture */}
            <div className="flex items-center justify-center mb-6">
              <img
                src="/assets/aistudio/Screenshot_20261111_191003_Attijari_Mobile_9a256bc6.jpg"
                alt="Attijariwafa bank"
                className="h-16 sm:h-18 w-auto max-w-[230px] object-contain rounded-lg"
              />
            </div>

            {/* Carte Blanche de Connexion */}
            <div className="w-full bg-white rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-gray-100/80 p-7 sm:p-8 flex flex-col items-center relative">
              {/* Bouton Changer d'utilisateur (en haut à droite) */}
              <button
                onClick={() => {
                  alert('Changement de compte utilisateur');
                }}
                className="absolute top-5 right-5 text-[#eb5545] p-1.5 hover:opacity-80 transition"
                title="Changer d'utilisateur"
              >
                {/* Icône deux personnes avec flèches circulaires */}
                <svg className="w-6 h-6 text-[#eb5545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M4 17a5 5 0 0 1 10 0" />
                  <circle cx="16" cy="6" r="2.2" />
                  <path d="M15 13a4 4 0 0 1 5 3" />
                  <path d="M2 10a9 9 0 0 1 4-5" />
                  <path d="M22 14a9 9 0 0 1-4 5" />
                </svg>
              </button>

              {/* Avatar AS Bleu */}
              <div className="w-20 h-20 rounded-full bg-[#00a2e8] text-white flex items-center justify-center font-black text-2xl shadow-sm mb-3">
                AS
              </div>

              {/* Titre Bienvenue Saber */}
              <h2 className="text-2xl font-black text-[#1e293b] mb-6 tracking-tight">
                Bienvenue Saber
              </h2>

              {/* Champ Mot de passe */}
              <div className="w-full relative mb-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePerformLogin(false);
                    }
                  }}
                  placeholder="Mot de passe"
                  className={`w-full bg-white border ${loginError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200/90'} rounded-2xl py-4 px-4 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#eb5545] focus:ring-1 focus:ring-[#eb5545] transition pr-12 shadow-2xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#eb5545] hover:opacity-80 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[2.2]" /> : <Eye className="w-5 h-5 stroke-[2.2]" />}
                </button>
              </div>

              {/* Message d'erreur mot de passe */}
              {loginError && (
                <div className="w-full text-left mb-3 px-1">
                  <p className="text-xs font-bold text-red-500">{loginError}</p>
                </div>
              )}
              {!loginError && <div className="mb-3"></div>}

              {/* Bouton Connexion */}
              <button
                type="button"
                onClick={() => handlePerformLogin(false)}
                disabled={isAuthenticating}
                className="w-full bg-[#eb5545] text-white font-black py-4 rounded-2xl text-[16px] shadow-md hover:bg-red-600 active:scale-[0.99] transition mb-6 cursor-pointer"
              >
                {isAuthenticating ? 'Connexion en cours...' : 'Connexion'}
              </button>

              {/* Séparateur Ou */}
              <div className="w-full flex items-center mb-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm font-black text-gray-400">Ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Bouton Empreinte digitale Touch ID / Face ID */}
              <button
                type="button"
                onClick={() => handlePerformLogin(true)}
                disabled={isAuthenticating}
                className="w-14 h-14 rounded-full bg-[#eb5545] text-white flex items-center justify-center shadow-lg shadow-red-500/25 hover:bg-red-600 transition active:scale-95 mb-6 cursor-pointer"
                title="Connexion par empreinte biométrique (Simo123@)"
              >
                <Fingerprint className="w-7 h-7 stroke-[2.2]" />
              </button>

              {/* Mot de passe oublié */}
              <button
                onClick={() => {
                  alert('Pour réinitialiser votre mot de passe, veuillez contacter votre agence ou le centre d’assistance au 0522 58 88 58.');
                }}
                className="text-[#eb5545] text-[15px] font-black hover:underline cursor-pointer"
              >
                Identifiant ou mot de passe oublié
              </button>
            </div>

            {/* Boutons Devenir Client et Télécharger l'APK */}
            <div className="my-5 flex flex-col items-center space-y-2.5">
              <button
                onClick={() =>
                  setPromoModal({
                    title: 'Devenir client Attijariwafa bank',
                    subtitle: 'Ouverture de compte rapide',
                    content: 'Ouvrez votre compte bancaire en ligne en quelques minutes avec votre smartphone et une pièce d’identité en cours de validité.',
                  })
                }
                className="bg-white border-2 border-[#eb5545] text-[#eb5545] font-black py-3 px-10 rounded-full text-[15px] shadow-sm hover:bg-red-50 transition active:scale-95 cursor-pointer"
              >
                Devenir client
              </button>

              <button
                type="button"
                onClick={handleTriggerInstall}
                className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#eb5545] py-1 transition cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.2] text-[#eb5545]" />
                <span>Télécharger l'APK / Installer</span>
              </button>
            </div>
          </div>

          {/* Barre inférieure à 3 onglets sur la page de connexion */}
          <div className="w-full bg-white border-t border-gray-100 py-2.5 px-6 flex justify-around items-center rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] mt-auto max-w-md mx-auto">
            {/* 1. Accueil (actif rouge) */}
            <button className="flex flex-col items-center text-[#eb5545] focus:outline-none">
              <Home className="w-6 h-6 fill-current" />
              <span className="text-[11px] font-black mt-1 text-[#eb5545]">Accueil</span>
            </button>

            {/* 2. Agences */}
            <button
              onClick={() =>
                setPromoModal({
                  title: 'Trouver une agence ou GAB',
                  subtitle: 'Réseau Attijariwafa bank',
                  content: 'Localisez les agences Attijariwafa bank et les distributeurs automatiques les plus proches de vous avec horaires d’ouverture.',
                })
              }
              className="flex flex-col items-center text-[#64748b] hover:text-gray-900 focus:outline-none"
            >
              <MapPin className="w-6 h-6" />
              <span className="text-[11px] font-semibold mt-1">Agences</span>
            </button>

            {/* 3. Menu */}
            <button
              onClick={() =>
                setPromoModal({
                  title: 'Services d’urgence & Contacts',
                  subtitle: 'Attijari Mobile',
                  content: 'Opposition sur carte 24h/24, assistance voyage, contact direct de votre conseiller et FAQ.',
                })
              }
              className="flex flex-col items-center text-[#64748b] hover:text-gray-900 focus:outline-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" />
                <rect x="14" y="3.5" width="6.5" height="6.5" rx="2" />
                <rect x="3.5" y="14" width="6.5" height="6.5" rx="2" />
                <rect x="14" y="14" width="6.5" height="6.5" rx="2" />
              </svg>
              <span className="text-[11px] font-semibold mt-1">Menu</span>
            </button>
          </div>

          {/* Pop-up Chargement ... 5 secondes exactement comme la capture Screenshot_20261111_190403 */}
          {isAuthenticating && (
            <div
              onClick={() => {
                setIsAuthenticating(false);
                setIsLoggedIn(true);
                setActiveTab('dashboard');
              }}
              className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-[1px] flex items-center justify-center p-4 cursor-pointer"
              title="Cliquez pour entrer immédiatement"
            >
              <div className="bg-white/90 backdrop-blur-md rounded-3xl py-7 px-10 shadow-2xl flex flex-col items-center justify-center border border-white/80 min-w-[210px] animate-in fade-in zoom-in-95 duration-200">
                {/* Anneau de chargement rouge/saumon officiel Attijari */}
                <div className="w-12 h-12 rounded-full border-[3.5px] border-red-100 border-t-[#eb5545] animate-spin mb-3.5"></div>
                <p className="text-[15px] font-bold text-gray-500 tracking-wide">Chargement ...</p>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">Connexion automatique en cours</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
        ></div>
      )}

      {/* Sidebar Desktop / Drawer Mobile */}
      <aside
        className={`w-80 bg-white text-gray-800 flex flex-col shadow-2xl z-50 fixed inset-y-0 left-0 transform transition duration-300 ease-in-out h-full md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête du Menu */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#008bd2] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              AS
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-black text-gray-900 text-base tracking-wide">SABER</span>
                <ChevronRight className="w-4 h-4 text-[#eb5545] stroke-[2.5]" />
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Dernière connexion: 10/11/2026 (00h09)</p>
            </div>
          </div>
          <button
            onClick={() => {
              executeWithLoading(() => setIsLoggedIn(false), 500);
            }}
            className="w-10 h-10 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center hover:bg-red-100 transition shadow-sm"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto pb-24">
          {/* Accueil */}
          <div
            onClick={() => handleTabSwitch('dashboard')}
            className={`border rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer transition ${
              activeTab === 'dashboard' ? 'border-[#eb5545] bg-red-50/20' : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Accueil</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
          </div>

          {/* Consultation */}
          <div
            onClick={() => handleTabSwitch('comptes')}
            className={`border rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer transition ${
              activeTab === 'comptes' || activeTab === 'transactions-pro' ? 'border-[#eb5545] bg-red-50/20' : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center relative">
                <CreditCard className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#eb5545] rounded-full"></span>
              </div>
              <span className="font-bold text-gray-800 text-sm">Consultation</span>
            </div>
            <ChevronDown className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
          </div>

          {/* Paiements et transferts (Dropdown) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm transition overflow-hidden">
            <div
              onClick={() => setPaiementsSubmenuOpen(!paiementsSubmenuOpen)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center relative">
                  <Send className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#eb5545] rounded-full"></span>
                </div>
                <span className="font-bold text-gray-800 text-sm">Paiements et transferts</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#eb5545] stroke-[2.5] transition-transform duration-200 ${
                  paiementsSubmenuOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {paiementsSubmenuOpen && (
              <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-3 text-sm text-gray-700">
                <div
                  onClick={() => {
                    handleTabSwitch('virements');
                    setVirementView('mes-virements');
                    setMesVirementsSubTab('traites');
                  }}
                  className={`py-2 px-2.5 rounded-xl cursor-pointer font-medium flex items-center justify-between transition ${
                    activeTab === 'virements' && virementView === 'mes-virements' ? 'bg-red-50 text-[#eb5545] font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-[#eb5545]" />
                    <span>Historique des virements traités</span>
                  </div>
                  <span className="text-[11px] font-black bg-red-100 text-[#eb5545] px-2 py-0.5 rounded-full">18</span>
                </div>

                <div
                  onClick={() => {
                    handleTabSwitch('virements');
                    setVirementView('etape1');
                  }}
                  className={`py-2 px-2.5 rounded-xl cursor-pointer font-medium flex items-center space-x-3 transition ${
                    activeTab === 'virements' && virementView === 'etape1' ? 'bg-red-50 text-[#eb5545] font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <Send className="w-4 h-4 text-gray-400" />
                  <span>Effectuer un virement</span>
                </div>

                <div
                  onClick={() => {
                    handleTabSwitch('virements');
                    setVirementView('beneficiaires');
                  }}
                  className={`py-2 px-2.5 rounded-xl cursor-pointer font-medium flex items-center space-x-3 transition ${
                    activeTab === 'virements' && virementView === 'beneficiaires' ? 'bg-red-50 text-[#eb5545] font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Gestion des bénéficiaires</span>
                </div>
              </div>
            )}
          </div>

          {/* Mes cartes */}
          <div
            onClick={() => handleTabSwitch('cartes')}
            className={`border rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer transition ${
              activeTab === 'cartes' ? 'border-[#eb5545] bg-red-50/20' : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Mes cartes</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
          </div>

          {/* Menu principal */}
          <div
            onClick={() => handleTabSwitch('menu')}
            className={`border rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer transition ${
              activeTab === 'menu' ? 'border-[#eb5545] bg-red-50/20' : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Menu</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
          </div>

          <div className="text-center pt-4 pb-4">
            <p className="text-xs text-gray-400 font-medium">Attijari pro v6.13.2</p>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50 relative pb-28">
        {/* ===================== TAB 1: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="p-4 md:p-8 max-w-2xl mx-auto w-full animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Bienvenue SABER</h2>
              <div
                onClick={() => {
                  setIsNotificationsOpen(true);
                  setHasUnreadNotif(false);
                }}
                className="relative bg-white p-2.5 rounded-full shadow-sm border border-gray-100 text-[#F08B00] cursor-pointer hover:bg-orange-50 transition"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                {hasUnreadNotif && (
                  <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </div>
            </div>

            {/* Solde Toggle */}
            <div className="flex items-center space-x-2 mb-4 text-gray-800 font-bold text-base">
              <span>Mon compte</span>
              <button
                onClick={() => setIsMaskedSoldes(!isMaskedSoldes)}
                className="text-gray-500 hover:text-[#F08B00] transition"
              >
                {isMaskedSoldes ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Horizontal Accounts Carousel */}
            <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar snap-x snap-mandatory">
              {/* Carte 1 : Compte Chèque */}
              <div
                onClick={() => handleTabSwitch('comptes')}
                className="min-w-[320px] sm:min-w-[350px] flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition snap-start"
              >
                <div className="bg-gradient-to-r from-[#eb5545] to-[#d63333] p-5 text-white relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">Compte chèque</h3>
                    <span className="text-white font-bold text-lg">⋮</span>
                  </div>
                  <p className="text-xs text-white/80 mt-2">Compte chèque</p>
                  <p className="text-sm font-mono font-medium tracking-wider mt-0.5">00713N300400592</p>
                </div>
                <div className="p-5 bg-white flex justify-end items-center">
                  <span className="text-2xl font-black text-gray-900 tracking-tight flex items-baseline">
                    {isMaskedSoldes ? (
                      '••••••'
                    ) : (
                      <>
                        3 252,
                        <span className="text-xs text-gray-600 font-bold ml-0.5 -translate-y-2 inline-block">
                          54 MAD
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Carte 2 : Compte Professionnel */}
              <div
                onClick={() => handleTabSwitch('transactions-pro')}
                className="min-w-[320px] sm:min-w-[350px] flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition snap-start"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">Compte Professionnel</h3>
                    <span className="text-white font-bold text-lg">⋮</span>
                  </div>
                  <p className="text-xs text-white/80 mt-2">Auto entrepreneur</p>
                  <p className="text-[11px] bg-white/20 inline-block px-2 py-0.5 rounded text-white font-medium mt-1">
                    Mastercard : 5311401000460298
                  </p>
                </div>
                <div className="p-5 bg-white flex justify-end items-center">
                  <span className="text-2xl font-black text-gray-900 tracking-tight flex items-baseline">
                    {isMaskedSoldes ? (
                      '••••••'
                    ) : (
                      <>
                        158 747,
                        <span className="text-xs text-gray-600 font-bold ml-0.5 -translate-y-2 inline-block">
                          57 MAD
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Carte 3 : Impôts */}
              <div className="min-w-[320px] sm:min-w-[350px] flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden snap-start">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 text-white relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">Impôts (T3)</h3>
                    <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">À jour</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">Échéance trimestrielle</p>
                  <p className="text-sm font-medium mt-0.5">Aucun impôt dû</p>
                </div>
                <div className="p-5 bg-white flex flex-col justify-between">
                  <div className="flex justify-end items-center">
                    <span className="text-2xl font-black text-gray-900 tracking-tight flex items-baseline">
                      0,<span className="text-xs text-gray-600 font-bold ml-0.5 -translate-y-2 inline-block">00 DH</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 italic text-right">
                    Prochaine mise à jour d'impôt le 15 novembre 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Dernières Opérations Section - Reproduction exacte des captures 1 à 6 */}
            <div className="relative mb-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                    Dernières Opérations
                  </h3>
                  <button
                    onClick={() => handleTabSwitch('transactions-pro')}
                    className="text-[#eb5545] font-bold text-xs sm:text-sm hover:underline"
                  >
                    Voir plus
                  </button>
                </div>

                <div className="space-y-1">
                  {operationsAccueil.map((op, idx) => (
                    <div
                      key={op.id}
                      onClick={() => {
                        setSelectedOperation(op);
                        setPreviousTab('dashboard');
                        executeWithLoading(() => {
                          setActiveTab('detail-operation');
                        }, 400);
                      }}
                      className={`flex items-center justify-between py-3.5 px-2 rounded-2xl cursor-pointer hover:bg-gray-50 transition group ${
                        idx !== operationsAccueil.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
                        {/* Icône verte avec flèche descendante vers la gauche conforme à la capture */}
                        <div className="w-11 h-11 rounded-full bg-[#52c48d] flex items-center justify-center text-white shrink-0 shadow-sm">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 5L5 19M5 19h10M5 19V9" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-800 text-xs sm:text-sm truncate group-hover:text-[#eb5545] transition">
                            {op.titreCourt}
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{op.date}</p>
                        </div>
                      </div>

                      <span className="font-black text-[#2e7d32] text-xs sm:text-sm whitespace-nowrap shrink-0">
                        {op.montant}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= NOUVELLES SECTIONS DU BAS DE L'ACCUEIL (Conformes aux 2 captures) ================= */}

            {/* 1. Carte Bannière Attijari Travel */}
            <div
              onClick={() =>
                setPromoModal({
                  title: 'Attijari Travel',
                  subtitle: 'Réservez votre séjour idéal',
                  content:
                    'Profitez d’offres hôtelières exclusives au Maroc et à l’international, avec jusqu’à -25% de réduction et paiement sécurisé en dirhams avec votre carte Attijariwafa bank.',
                })
              }
              className="relative overflow-hidden rounded-[28px] mb-4 shadow-md min-h-[195px] flex flex-col justify-between p-5 sm:p-6 text-white cursor-pointer group transition hover:shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Filigrane d'avion subtil en haut à droite */}
              <svg
                className="absolute -top-3 -right-3 w-36 h-36 text-white/[0.08] pointer-events-none transform rotate-12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>

              <div>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                  Attijari Travel
                </h4>
                <p className="text-xs sm:text-sm text-white/90 max-w-[270px] sm:max-w-xs font-medium leading-relaxed">
                  Réservez votre séjour idéal en quelques clics et profitez d'offres exclusives.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button className="bg-white text-gray-900 font-bold px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center space-x-2 shadow-sm group-hover:bg-gray-100 transition active:scale-95">
                  <span>Réservez dès maintenant</span>
                  <svg
                    className="w-4 h-4 text-[#eb5545]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Badge translucide icône lit d'hôtel */}
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-sm">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Carte Bannière Simple. Pay */}
            <div
              onClick={() =>
                setPromoModal({
                  title: 'Simple. Pay',
                  subtitle: 'Payer ou recevoir en un clic',
                  content:
                    'Solution de paiement et d’encaissement mobile rapide et instantanée. Réglez vos achats en magasin ou recevez vos paiements clients par simple scan QR Code.',
                })
              }
              className="relative overflow-hidden rounded-[28px] mb-6 shadow-md min-h-[195px] flex flex-col justify-between p-5 sm:p-6 text-white cursor-pointer group transition hover:shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.25) 100%), url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <h4 className="text-2xl font-black text-white tracking-tight">Simple.</h4>
                  <span className="bg-white text-gray-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-sm">
                    Pay
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 max-w-[260px] font-medium leading-relaxed">
                  Payez ou encaissez de l'argent en un clic
                </p>
              </div>

              <div className="pt-4">
                <button className="bg-white text-gray-900 font-bold px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center space-x-2 shadow-sm group-hover:bg-gray-100 transition active:scale-95">
                  <span>Payer ou recevoir</span>
                  <svg
                    className="w-4 h-4 text-[#eb5545]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 3. Section "Spécialement pour vous" */}
            {(showSecureCard || showAppareilsCard) && (
              <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-3 px-1">
                  Spécialement pour vous
                </h3>

                <div className="flex space-x-3.5 overflow-x-auto pb-2 no-scrollbar">
                  {/* Carte 1 : Attijari Secure (vert menthe) */}
                  {showSecureCard && (
                    <div className="min-w-[210px] sm:min-w-[230px] flex-1 bg-[#d7f7e9] border border-[#a6f0cc] rounded-[26px] p-4 sm:p-5 relative flex flex-col justify-between min-h-[160px] shadow-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSecureCard(false);
                        }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <p className="font-extrabold text-gray-900 text-sm sm:text-[15px] leading-tight pr-5">
                        Facilitez<br />
                        vos transa<br />
                        ctions via<br />
                        Attijari<br />
                        Secure
                      </p>

                      <div className="self-end mt-1">
                        <svg className="w-14 h-14" viewBox="0 0 54 54" fill="none">
                          <path
                            d="M27 4L8 11V25C8 37 16 47.5 27 50C38 47.5 46 37 46 25V11L27 4Z"
                            fill="#9af3c6"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                          />
                          <rect x="20" y="25" width="14" height="12" rx="3" fill="white" />
                          <path
                            d="M24 25V20A3 3 0 0 1 30 20V25"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="27" cy="30" r="1.5" fill="#22c55e" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Carte 2 : Appareils de confiance (pêche dorée) */}
                  {showAppareilsCard && (
                    <div className="min-w-[210px] sm:min-w-[230px] flex-1 bg-[#fef2d6] border border-[#fde2a6] rounded-[26px] p-4 sm:p-5 relative flex flex-col justify-between min-h-[160px] shadow-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAppareilsCard(false);
                        }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <p className="font-extrabold text-gray-900 text-sm sm:text-[15px] leading-tight pr-5">
                        Gérez vos<br />
                        appareils<br />
                        de<br />
                        confiance
                      </p>

                      <div className="self-end mt-1">
                        <svg className="w-16 h-14" viewBox="0 0 60 50" fill="none">
                          <rect x="4" y="6" width="34" height="24" rx="3" fill="#fff9eb" stroke="#f08b00" strokeWidth="2.2" />
                          <line x1="21" y1="30" x2="21" y2="38" stroke="#f08b00" strokeWidth="2.2" />
                          <line x1="14" y1="38" x2="28" y2="38" stroke="#f08b00" strokeWidth="2.2" />
                          <path d="M16 14l5-2 5 2v5c0 4-2.5 7-5 8-2.5-1-5-4-5-8v-5z" fill="#f08b00" />
                          <path d="M19 19l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="34" y="16" width="18" height="26" rx="3" fill="#fff9eb" stroke="#f08b00" strokeWidth="2.2" />
                          <circle cx="43" cy="38" r="1.5" fill="#f08b00" />
                          <path d="M39 23l4-1.5 4 1.5v4c0 3-2 5.5-4 6.5-2-1-4-3.5-4-6.5v-4z" fill="#f08b00" />
                          <path d="M41.5 27l1 1 2.5-2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Section "Nouveautés" (Stories / Posters verticaux) */}
            <div className="mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-3 px-1">
                Nouveautés
              </h3>

              <div className="flex space-x-3.5 overflow-x-auto pb-2 no-scrollbar snap-x">
                {/* Story 1 : Agences Wafacash */}
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Réseau Wafacash',
                      subtitle: 'Dépôts et retraits en agence',
                      content:
                        'Effectuez vos dépôts et retraits d’espèces dans plus de 2 000 agences Wafacash partout au Maroc, avec des horaires étendus du lundi au dimanche.',
                    })
                  }
                  className="min-w-[165px] sm:min-w-[185px] h-[270px] rounded-[24px] border-2 border-red-200/70 overflow-hidden relative shadow-md p-4 flex flex-col justify-between shrink-0 snap-start cursor-pointer hover:shadow-lg transition bg-gradient-to-b from-[#251e06] via-[#49390a] to-[#171302] text-white"
                >
                  <p className="text-[11px] font-black text-amber-300 uppercase leading-snug tracking-tight text-center drop-shadow-sm">
                    DÉPÔTS ET RETRAITS ESPÈCES DÉSORMAIS POSSIBLES DANS PLUS DE 2 000 AGENCES WAFACASH
                  </p>

                  {/* Tampon rouge exclusivité */}
                  <div className="w-13 h-13 mx-auto rounded-full border-2 border-dashed border-red-400 bg-red-600/95 text-white flex flex-col items-center justify-center p-1 text-center shadow-lg transform -rotate-12">
                    <span className="text-[6.5px] font-black leading-tight uppercase">
                      EXCLUSIVITÉ CLIENTS ATTIJARIWAFA BANK
                    </span>
                  </div>

                  {/* Comptoir Wafacash */}
                  <div className="bg-[#facc15] text-gray-950 p-2 rounded-xl text-center shadow-inner">
                    <p className="text-[10px] font-black tracking-wider flex items-center justify-center space-x-1">
                      <span>وفاكاش</span>
                      <span className="text-[#eb5545] font-black">▶</span>
                      <span>Wafacash</span>
                    </p>
                  </div>
                </div>

                {/* Story 2 : Cash Express */}
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Cash Express',
                      subtitle: 'Retrait sans carte sur tous les GAB',
                      content:
                        'Transférez de l’argent depuis votre application vers vos proches ou pour vous-même, retirable immédiatement sans carte bancaire sur tous les guichets automatiques Attijariwafa bank.',
                    })
                  }
                  className="min-w-[165px] sm:min-w-[185px] h-[270px] rounded-[24px] border-2 border-red-200/70 overflow-hidden relative shadow-md p-4 flex flex-col justify-between shrink-0 snap-start cursor-pointer hover:shadow-lg transition bg-gradient-to-b from-[#182333] via-[#33465e] to-[#121c29] text-white"
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase text-center">
                      AVEC CASH EXPRESS
                    </p>
                    <p className="text-sm font-black text-amber-400 uppercase text-center tracking-tight mt-0.5">
                      ENVOYEZ
                    </p>
                    <p className="text-[10px] font-extrabold text-white uppercase text-center mt-0.5">
                      DE L'ARGENT DEPUIS ATTIJARI MOBILE
                    </p>
                  </div>

                  {/* Illustration split */}
                  <div className="flex items-center justify-center space-x-1 py-3">
                    <div className="w-10 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-amber-400 font-black text-xs">➔</span>
                    <div className="w-10 h-16 rounded-lg bg-orange-600/80 border border-orange-400 flex items-center justify-center text-white">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-[9px] text-white/80 font-bold uppercase text-center mt-auto leading-tight">
                    VERS TOUS LES GAB ATTIJARIWAFA BANK
                  </p>
                </div>

                {/* Story 3 : Vos virements instantanés */}
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Virements Instantanés',
                      subtitle: 'Crédit en 20 secondes',
                      content:
                        'Envoyez de l’argent 24h/24 et 7j/7 vers toutes les banques marocaines participantes, crédité en temps réel sur le compte du bénéficiaire.',
                    })
                  }
                  className="min-w-[165px] sm:min-w-[185px] h-[270px] rounded-[24px] border-2 border-red-200/70 overflow-hidden relative shadow-md p-4 flex flex-col justify-between shrink-0 snap-start cursor-pointer hover:shadow-lg transition bg-gradient-to-b from-[#5c1c14] via-[#852b20] to-[#3a0e08] text-white"
                >
                  <div>
                    <p className="text-xs font-black text-white uppercase text-center leading-snug">
                      VOS <span className="text-amber-300">VIREMENTS</span> INSTANTANÉS
                    </p>
                    <p className="text-[10px] text-white/90 font-bold uppercase text-center mt-1">
                      SIMPLES ET SÉCURISÉS
                    </p>
                  </div>

                  <div className="w-14 h-14 mx-auto rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center text-amber-300 shadow-md">
                    <Clock className="w-7 h-7" />
                  </div>

                  <p className="text-[9px] text-white/80 font-medium text-center mt-auto">
                    DEPUIS VOTRE APPLI
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Carte Shop&Go */}
            <div
              onClick={() =>
                setPromoModal({
                  title: 'Shop&Go',
                  subtitle: 'Remises et Avantages Partenaires',
                  content:
                    'Accédez au programme d’avantages exclusifs réservé aux clients Attijariwafa bank. Réductions chez plus de 150 enseignes partenaires mode, high-tech, voyages et restauration.',
                })
              }
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition mb-3 group"
            >
              <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
                <div
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 relative bg-amber-50 shadow-inner"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                    Shop<span className="text-[#eb5545]">&</span><span className="text-[#eb5545]">Go</span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                    Bénéficiez de remises et services privilégiés grâce à nos partenariats.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-[#eb5545] stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* 6. Carte Découvrez nos produits et services */}
            <div
              onClick={() =>
                setPromoModal({
                  title: 'Nos Produits et Services',
                  subtitle: 'Solutions bancaires complètes',
                  content:
                    'Découvrez l’ensemble des offres Attijariwafa bank pour les Auto-Entrepreneurs : financements d’activité, packs bancaires, assurances santé et prévoyance, solutions d’épargne.',
                })
              }
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition mb-3 group"
            >
              <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
                <div
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 relative bg-blue-50 shadow-inner"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                    Découvrez nos produits et services
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                    Nos services pour tous vos besoins réunis au même endroit, pour vous ...
                  </p>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-[#eb5545] stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        {/* ===================== VUE DÉDIÉE : DÉTAIL OPÉRATION (Captures 2 à 6) ===================== */}
        {activeTab === 'detail-operation' && selectedOperation && (
          <div className="p-4 md:p-8 max-w-xl mx-auto w-full animate-in fade-in duration-200">
            {/* Header avec bouton retour rouge */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => handleTabSwitch(previousTab)}
                className="text-[#eb5545] p-1 -ml-1 hover:opacity-80 transition"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Détail opération</h2>
              <div className="w-6"></div>
            </div>

            {/* Montant en gros vert/rouge + Titre + Bouton rond flèche haut-droite */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
              <div className="space-y-1">
                <p className={`text-3xl sm:text-4xl font-black tracking-tight ${selectedOperation.isDebit ? 'text-red-600' : 'text-[#1ba05b]'}`}>
                  {selectedOperation.montant}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
                  {selectedOperation.titreComplet}
                </p>
              </div>

              {/* Bouton rond avec flèche diagonale montante */}
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 shadow-sm shrink-0 mt-1 hover:bg-gray-50 cursor-pointer">
                <ArrowUpRight className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Liste des détails : Date de valeur, Date d'opération, N° de compte, Montant */}
            <div className="space-y-6">
              <div>
                <span className="block text-sm font-bold text-gray-400">Date de valeur</span>
                <span className="block text-base font-extrabold text-gray-900 mt-1">
                  {selectedOperation.date}
                </span>
              </div>

              <div>
                <span className="block text-sm font-bold text-gray-400">Date d'opération</span>
                <span className="block text-base font-extrabold text-gray-900 mt-1">
                  {selectedOperation.date}
                </span>
              </div>

              <div>
                <span className="block text-sm font-bold text-gray-400">N° de compte</span>
                <span className="block text-base font-extrabold text-gray-900 mt-1 font-mono">
                  {selectedOperation.compte}
                </span>
              </div>

              <div>
                <span className="block text-sm font-bold text-gray-400">Montant</span>
                <span className={`block text-base font-extrabold mt-1 ${selectedOperation.isDebit ? 'text-red-600' : 'text-gray-900'}`}>
                  {selectedOperation.montant}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: COMPTE CHEQUE ===================== */}
        {activeTab === 'comptes' && (
          <div className="p-4 md:p-8 space-y-6 max-w-xl mx-auto w-full animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Compte chèque</h2>
              <div className="w-6"></div>
            </div>

            {/* Solde Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Compte chèque</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">00713N300400592</p>
                </div>
                <button className="text-[#eb5545] font-bold text-xl px-1">⋮</button>
              </div>
              <div className="mt-4 text-left">
                <span className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline">
                  {isMaskedSoldes ? (
                    '••••••'
                  ) : (
                    <>
                      3 252,
                      <span className="text-sm text-gray-600 font-bold ml-0.5 -translate-y-2 inline-block">
                        54 MAD
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleTabSwitch('transactions-pro')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow flex items-center justify-center space-x-2 hover:opacity-95 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Compte Professionnel (158 747,57 MAD)</span>
              </button>
              <button
                onClick={() => {
                  handleTabSwitch('virements');
                  setVirementView('mes-virements');
                  setMesVirementsSubTab('traites');
                }}
                className="flex-1 bg-[#eb5545] text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow flex items-center justify-center space-x-2 hover:bg-red-600 transition"
              >
                <Clock className="w-4 h-4" />
                <span>Voir les virements traités</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: COMPTE PRO ===================== */}
        {activeTab === 'transactions-pro' && (
          <div className="p-4 md:p-8 max-w-xl mx-auto w-full animate-in fade-in duration-200">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-6 relative">
              <button
                onClick={() => handleTabSwitch('dashboard')}
                className="text-[#eb5545] p-1 -ml-1 hover:opacity-80 transition"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Account Dropdown Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenuPro(!showAccountMenuPro)}
                  className="flex items-center space-x-1.5 py-1 px-3 rounded-full hover:bg-gray-100 transition"
                >
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mon compte</h2>
                  <ChevronDown className={`w-5 h-5 text-gray-700 transition-transform ${showAccountMenuPro ? 'rotate-180' : ''}`} />
                </button>

                {showAccountMenuPro && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-10 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-30 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setShowAccountMenuPro(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-red-50 text-[#eb5545] font-bold text-sm flex items-center justify-between"
                    >
                      <div>
                        <p className="font-extrabold text-xs text-[#eb5545]">Compte Professionnel</p>
                        <p className="text-[10px] text-gray-500 font-mono">5311401000460298</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#eb5545]" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountMenuPro(false);
                        handleTabSwitch('comptes');
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition mt-1"
                    >
                      <div>
                        <p className="font-extrabold text-xs text-gray-800">Compte chèque</p>
                        <p className="text-[10px] text-gray-400 font-mono">00713N300400592</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Action Buttons: Filter & Search */}
              <div className="flex items-center space-x-3 text-[#eb5545]">
                <button
                  onClick={() => setShowFilterPro(!showFilterPro)}
                  className={`p-1.5 rounded-full transition ${showFilterPro ? 'bg-red-50 text-[#eb5545]' : 'hover:bg-gray-100 text-[#eb5545]'}`}
                  title="Filtrer"
                >
                  <SlidersHorizontal className="w-6 h-6 stroke-[2]" />
                </button>
                <button
                  onClick={() => setShowProSearchBar(!showProSearchBar)}
                  className={`p-1.5 rounded-full transition ${showProSearchBar ? 'bg-red-50 text-[#eb5545]' : 'hover:bg-gray-100 text-[#eb5545]'}`}
                  title="Rechercher"
                >
                  <Search className="w-6 h-6 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Optional Search Bar */}
            {showProSearchBar && (
              <div className="mb-4 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-2 animate-in fade-in">
                <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                <input
                  type="text"
                  value={searchProQuery}
                  onChange={(e) => setSearchProQuery(e.target.value)}
                  placeholder="Rechercher une opération..."
                  className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none"
                  autoFocus
                />
                {searchProQuery && (
                  <button onClick={() => setSearchProQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Optional Filter Pills */}
            {showFilterPro && (
              <div className="mb-5 flex space-x-2 overflow-x-auto pb-1 no-scrollbar animate-in fade-in">
                <button
                  onClick={() => setFilterProType('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    filterProType === 'all'
                      ? 'bg-[#eb5545] text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Toutes ({operationsProData.length})
                </button>
                <button
                  onClick={() => setFilterProType('credit')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    filterProType === 'credit'
                      ? 'bg-[#52c48d] text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Entrées (+) ({operationsProData.filter(op => !op.isDebit).length})
                </button>
                <button
                  onClick={() => setFilterProType('debit')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    filterProType === 'debit'
                      ? 'bg-[#eb5545] text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Sorties (-) ({operationsProData.filter(op => op.isDebit).length})
                </button>
              </div>
            )}

            {/* Solde Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Compte Professionnel</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">5311401000460298</p>
                </div>
                <button className="text-[#eb5545] font-bold text-xl px-1">⋮</button>
              </div>
              <div className="mt-4 text-left">
                <span className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline">
                  {isMaskedSoldes ? (
                    '••••••'
                  ) : (
                    <>
                      158 747,
                      <span className="text-sm text-gray-600 font-bold ml-0.5 -translate-y-2 inline-block">
                        57 MAD
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Liste complète des opérations groupées par mois (Exactement selon les 16 captures d'écran) */}
            <div className="space-y-6">
              {['Octobre 2026', 'Septembre 2026', 'Août 2026'].map((mois) => {
                const operationsDuMois = operationsProData.filter(
                  (op) =>
                    op.mois === mois &&
                    (searchProQuery === '' ||
                      op.titreCourt.toLowerCase().includes(searchProQuery.toLowerCase()) ||
                      op.titreComplet.toLowerCase().includes(searchProQuery.toLowerCase()) ||
                      op.montant.toLowerCase().includes(searchProQuery.toLowerCase())) &&
                    (filterProType === 'all' ||
                      (filterProType === 'credit' && !op.isDebit) ||
                      (filterProType === 'debit' && op.isDebit))
                );

                if (operationsDuMois.length === 0) return null;

                return (
                  <div key={mois}>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 px-1">
                      {mois}
                    </h3>
                    <div className="space-y-3">
                      {operationsDuMois.map((op) => (
                        <div
                          key={op.id}
                          onClick={() => {
                            setSelectedOperation(op);
                            setPreviousTab('transactions-pro');
                            executeWithLoading(() => {
                              setActiveTab('detail-operation');
                            }, 400);
                          }}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#eb5545] transition group active:scale-[0.99]"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                            {/* Icône circulaire : Rouge pour débit avec flèche montante ↗, Verte pour crédit avec flèche descendante ↙ */}
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${
                                op.isDebit ? 'bg-[#eb5545]' : 'bg-[#52c48d]'
                              }`}
                            >
                              {op.isDebit ? (
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5M19 5v10M19 5H9" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 5L5 19M5 19h10M5 19V9" />
                                </svg>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-sm truncate group-hover:text-[#eb5545] transition">
                                {op.titreCourt}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{op.date}</p>
                            </div>
                          </div>

                          <span
                            className={`font-black text-sm whitespace-nowrap shrink-0 ${
                              op.isDebit ? 'text-[#eb5545]' : 'text-[#2e7d32]'
                            }`}
                          >
                            {op.montant}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Message aucun résultat si filtre ou recherche vide */}
              {operationsProData.filter(
                (op) =>
                  (searchProQuery === '' ||
                    op.titreCourt.toLowerCase().includes(searchProQuery.toLowerCase()) ||
                    op.titreComplet.toLowerCase().includes(searchProQuery.toLowerCase()) ||
                    op.montant.toLowerCase().includes(searchProQuery.toLowerCase())) &&
                  (filterProType === 'all' ||
                    (filterProType === 'credit' && !op.isDebit) ||
                    (filterProType === 'debit' && op.isDebit))
              ).length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-bold text-sm">Aucune opération ne correspond à vos critères</p>
                  <button
                    onClick={() => {
                      setSearchProQuery('');
                      setFilterProType('all');
                    }}
                    className="mt-3 text-xs font-bold text-[#eb5545] underline"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: CARTES ===================== */}
        {activeTab === 'cartes' && (
          <div className="p-4 md:p-8 max-w-xl mx-auto w-full animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Mes cartes</h2>
              <button className="text-[#eb5545]">
                <Search className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-200/70 p-1.5 rounded-full flex mb-6">
              <button
                onClick={() => setCartesSubTab('physiques')}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
                  cartesSubTab === 'physiques' ? 'bg-[#eb5545] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Cartes physiques
              </button>
              <button
                onClick={() => setCartesSubTab('virtuelles')}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
                  cartesSubTab === 'virtuelles' ? 'bg-[#eb5545] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Cartes virtuelles
              </button>
            </div>

            {cartesSubTab === 'physiques' ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-14 rounded-xl overflow-hidden shadow-md border border-gray-300 shrink-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500 flex flex-col justify-between p-2 relative">
                      <div className="flex justify-between items-center">
                        <div className="w-3 h-2.5 bg-amber-200 rounded-[2px] border border-amber-400"></div>
                        <span className="text-[7px] font-black tracking-widest text-gray-700">TITANIUM</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[7px] font-mono font-bold text-gray-800">•••• 3490</div>
                        <div className="flex space-x-0.5">
                          <div className="w-2 h-2 rounded-full bg-red-600 opacity-90"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-500 opacity-90 -ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">Carte Mastercard Titani...</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">xxxx3490</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">06/27</p>
                    </div>
                  </div>
                  <button className="text-[#eb5545] font-bold text-xl px-2">⋮</button>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-900 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-14 rounded-xl overflow-hidden shadow-md border border-purple-900 shrink-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex flex-col justify-between p-2 relative">
                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500 via-transparent to-transparent"></div>
                      <div className="relative z-10 flex justify-between items-center">
                        <span className="text-[8px] font-black italic tracking-wider text-pink-400">wajda</span>
                        <div className="w-2.5 h-2 bg-amber-300 rounded-[2px]"></div>
                      </div>
                      <div className="relative z-10 flex justify-between items-end">
                        <div className="text-[7px] font-mono font-bold text-yellow-400">•••• 0298</div>
                        <div className="flex space-x-0.5">
                          <div className="w-2 h-2 rounded-full bg-red-600 opacity-90"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-500 opacity-90 -ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">Carte Wajda</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">xxxx0298</p>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">Renouveler</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">11/31</p>
                    </div>
                  </div>
                  <button className="text-[#eb5545] font-bold text-xl px-2">⋮</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm font-medium">
                Aucune carte virtuelle active pour le moment.
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: VIREMENTS ===================== */}
        {activeTab === 'virements' && (
          <div className="p-2 sm:p-4 md:p-8 flex justify-center items-start">
            <div
              className="max-w-[440px] w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 relative flex flex-col"
              style={{ minHeight: '760px', height: '85vh', maxHeight: '820px' }}
            >
              {/* ================= VIEW: MES VIREMENTS (HISTORIQUE DES VIREMENTS TRAITÉS) ================= */}
              {virementView === 'mes-virements' && (
                <div className="h-full flex flex-col bg-white">
                  {/* Top Header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button
                      onClick={() => handleVirementViewSwitch('etape1')}
                      className="text-[#eb5545] hover:opacity-80 p-1 -ml-1"
                    >
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mes virements</h2>
                    <button
                      onClick={() => setShowSearchBar(!showSearchBar)}
                      className="text-[#eb5545] p-1 hover:opacity-80"
                      title="Rechercher"
                    >
                      <Search className="w-6 h-6 stroke-[2]" />
                    </button>
                  </div>

                  {/* Optional Search Bar */}
                  {showSearchBar && (
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher un virement..."
                          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#eb5545]"
                        />
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Subtabs matching Screenshot: [Traités] [Planifiés] [Permanents] */}
                  <div className="p-4 bg-white border-b border-gray-100">
                    <div className="bg-gray-100/90 p-1.5 rounded-full flex shadow-inner">
                      <button
                        onClick={() => setMesVirementsSubTab('traites')}
                        className={`flex-1 py-2 rounded-full text-xs font-bold transition text-center truncate ${
                          mesVirementsSubTab === 'traites'
                            ? 'bg-[#eb5545] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Traités
                      </button>
                      <button
                        onClick={() => setMesVirementsSubTab('planif')}
                        className={`flex-1 py-2 rounded-full text-xs font-bold transition text-center truncate ${
                          mesVirementsSubTab === 'planif'
                            ? 'bg-[#eb5545] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Planifiés
                      </button>
                      <button
                        onClick={() => setMesVirementsSubTab('perm')}
                        className={`flex-1 py-2 rounded-full text-xs font-bold transition text-center truncate ${
                          mesVirementsSubTab === 'perm'
                            ? 'bg-[#eb5545] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Permanents
                      </button>
                    </div>
                  </div>

                  {/* Scrollable list of virements */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
                    {/* ====== ONGLET TRAITÉS ====== */}
                    {mesVirementsSubTab === 'traites' && (
                      <div className="space-y-5">
                        {Object.keys(groupedVirements).length === 0 ? (
                          <div className="text-center py-12 text-gray-400 text-sm font-medium">
                            Aucun virement traité ne correspond à votre recherche.
                          </div>
                        ) : (
                          Object.entries(groupedVirements).map(([mois, items]) => (
                            <div key={mois} className="space-y-2.5">
                              {/* Month Heading as seen in Screenshot 6 */}
                              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1">
                                {mois}
                              </h3>

                              <div className="space-y-2">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => handleOpenDetailTraite(item)}
                                    className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#F08B00] hover:shadow-md transition group"
                                  >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                      {/* Icon (Cyan circular container with arrows or instant clock) */}
                                      {renderVirementIcon(item.type)}

                                      {/* Beneficiary Name & Date */}
                                      <div className="min-w-0 flex-1 pr-2">
                                        <h4 className="font-extrabold text-gray-900 text-sm tracking-tight truncate group-hover:text-[#eb5545] transition">
                                          {item.beneficiaire}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{item.date}</p>
                                      </div>
                                    </div>

                                    {/* Amount & Status Badge */}
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-gray-900 text-sm sm:text-base block tracking-tight">
                                        {item.montant}
                                      </span>
                                      <span className="text-[11px] font-bold text-green-600 block mt-0.5">
                                        {item.statut}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* ====== ONGLET PLANIFIÉS ====== */}
                    {mesVirementsSubTab === 'planif' && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1">
                          Novembre 2026
                        </h3>

                        {virementsPlanifiesData.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleOpenDetailPlanifie(item)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#F08B00] transition"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#84c5d6] text-white flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 stroke-[2]" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{item.beneficiaire}</h4>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{item.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className="font-black text-gray-900 text-sm block">{item.montant}</span>
                                <span className="text-[11px] font-medium text-amber-600">{item.statut}</span>
                              </div>
                              <button className="text-[#eb5545] font-bold text-xl px-1">⋮</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ====== ONGLET PERMANENTS ====== */}
                    {mesVirementsSubTab === 'perm' && (
                      <div className="text-center py-16 text-gray-400 text-sm font-medium">
                        Aucun ordre permanent actif.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= VIEW: DÉTAIL D'UN VIREMENT ================= */}
              {virementView === 'detail-virement' && detailVirement && (
                <div className="h-full flex flex-col bg-white">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button
                      onClick={() => handleVirementViewSwitch('mes-virements')}
                      className="text-[#eb5545] p-1 -ml-1"
                    >
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Détail virement</h2>
                    <button className="text-[#eb5545]">
                      <Share2 className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">
                    <div>
                      <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        {detailVirement.montant}
                      </p>
                      <p className="text-sm font-bold text-gray-600 mt-1">{detailVirement.beneficiaire}</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Emetteur</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.emetteur}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Compte émetteur</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5 font-mono">
                          {detailVirement.compteEmetteur}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Bénéficiaire</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.beneficiaire}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">RIB</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5 font-mono">
                          {detailVirement.rib}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Montant</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.montant}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Statut</span>
                        <span className={`block text-sm font-extrabold mt-0.5 ${detailVirement.statutColor}`}>
                          {detailVirement.statut}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Date d'initiation</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.dateInitiation}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Date d'exécution</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.dateExecution}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400">Motif</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {detailVirement.motif}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setMontantVirement(detailVirement.montant.replace(' DH', ''));
                          setMotifVirement(detailVirement.motif);
                          handleVirementViewSwitch('etape1');
                        }}
                        className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-[15px] shadow hover:bg-red-600 transition"
                      >
                        Effectuer un virement similaire
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= VIEW: ÉTAPE 1/4 (Émetteur et Bénéficiaire) ================= */}
              {virementView === 'etape1' && (
                <div className="h-full flex flex-col bg-white">
                  {/* Top Header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545] hover:opacity-80 p-1 -ml-1">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Virement</h2>
                    <button
                      onClick={() => {
                        handleVirementViewSwitch('mes-virements');
                        setMesVirementsSubTab('traites');
                      }}
                      className="text-[#eb5545] hover:opacity-80 p-1 -mr-1"
                      title="Historique des virements traités"
                    >
                      {/* Icône horloge / historique circulaire identique à la photo */}
                      <svg className="w-6 h-6 text-[#eb5545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 15" />
                        <path d="M3.05 11a9 9 0 0 1 .5-2" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                    {/* Step indicator 1/4 */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeWidth="3.2"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#eb5545]"
                            strokeDasharray="25, 100"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-extrabold text-gray-900 text-sm">
                          1/4
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-[17px] leading-tight">Émetteur et bénéficiaire</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Etape Suivante: Saisie du montant</p>
                      </div>
                    </div>

                    {/* Segmented control: Nouveau / Favoris */}
                    <div className="bg-[#f1f3f6] p-1.5 rounded-full flex shadow-inner">
                      <button className="flex-1 py-2.5 rounded-full text-sm font-bold bg-[#eb5545] text-white shadow-sm transition">
                        Nouveau
                      </button>
                      <button
                        onClick={() => handleVirementViewSwitch('beneficiaires')}
                        className="flex-1 py-2.5 rounded-full text-sm font-bold text-[#eb5545] hover:bg-white/40 transition"
                      >
                        Favoris
                      </button>
                    </div>

                    {/* DGI Warning for Pro Account */}
                    {selectedCompteEmetteur.id === 'compte-pro' && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start space-x-3 text-amber-900 shadow-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-semibold leading-relaxed">
                          Les virements depuis ce compte professionnel sont suspendus pour le moment en attendant la
                          confirmation de la DGI. Vous pouvez sélectionner le Compte chèque.
                        </p>
                      </div>
                    )}

                    {/* Emetteur Card */}
                    <div
                      onClick={() => setIsChoixCompteOpen(true)}
                      className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-full bg-[#eb5545] text-white flex items-center justify-center shrink-0 shadow-sm">
                          {/* Chequebook icon */}
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="6" width="18" height="12" rx="2" />
                            <line x1="7" y1="10" x2="13" y2="10" />
                            <line x1="7" y1="14" x2="11" y2="14" />
                            <path d="M15 15l3-3 2 2-3 3h-2v-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-[15px] leading-snug">{selectedCompteEmetteur.title}</h4>
                          <p className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">{selectedCompteEmetteur.rib}</p>
                          <p className="text-sm font-extrabold text-[#10b981] mt-1">
                            {selectedCompteEmetteur.solde}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                    </div>

                    {/* Bénéficiaire */}
                    <div className="space-y-2 pt-1">
                      <h4 className="text-gray-500 font-bold text-sm">Bénéficiaire</h4>
                      {selectedBeneficiaire ? (
                        <div className="bg-white border border-[#F08B00] shadow-[0_2px_14px_rgba(0,0,0,0.06)] rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3.5 pr-2">
                            <div
                              className={`w-11 h-11 rounded-full ${selectedBeneficiaire.color} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
                            >
                              {selectedBeneficiaire.initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{selectedBeneficiaire.nom}</h4>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">RIB: {selectedBeneficiaire.rib}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleVirementViewSwitch('beneficiaires')}
                            className="text-[#eb5545] font-bold text-xs hover:underline shrink-0"
                          >
                            Modifier
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleVirementViewSwitch('beneficiaires')}
                          className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.04)] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-gray-200 transition"
                        >
                          <span className="font-bold text-gray-900 text-[15px]">
                            Choisissez ou ajoutez un bénéficiaire
                          </span>
                          <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-white border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => {
                        if (selectedCompteEmetteur.id === 'compte-pro') {
                          alert(
                            'Impossible de continuer : Les virements depuis ce compte professionnel sont suspendus pour le moment en attendant la confirmation de la DGI. Veuillez choisir le Compte chèque.'
                          );
                          return;
                        }
                        if (!selectedBeneficiaire) {
                          handleVirementViewSwitch('beneficiaires');
                          return;
                        }
                        handleVirementViewSwitch('etape2');
                      }}
                      className={`w-full font-bold py-4 rounded-full text-[15px] transition ${
                        !selectedBeneficiaire
                          ? 'bg-[#e2e8f0] text-slate-400 cursor-pointer'
                          : selectedCompteEmetteur.id === 'compte-pro'
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#eb5545] text-white hover:bg-red-600 shadow-md cursor-pointer'
                      }`}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: ÉTAPE 2/4 (Montant) ================= */}
              {virementView === 'etape2' && (
                <div className="h-full flex flex-col bg-white">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button onClick={() => handleVirementViewSwitch('etape1')} className="text-gray-800 hover:text-[#eb5545]">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Virement</h2>
                    <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#eb5545]"
                            strokeDasharray="50, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900 text-sm">
                          2/4
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base leading-snug">Saisie du montant</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Etape Suivante: Type du virement</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-gray-500 font-bold text-sm mb-3">Saisissez un montant</h4>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm mb-4 focus-within:border-[#eb5545] transition">
                        <label className="block text-[11px] text-gray-400 font-medium">Montant (DH)</label>
                        <input
                          type="text"
                          value={montantVirement}
                          onChange={(e) => setMontantVirement(e.target.value)}
                          placeholder="0,00"
                          className="w-full text-xl font-black text-gray-900 outline-none mt-0.5 bg-transparent"
                        />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm focus-within:border-[#eb5545] transition">
                        <input
                          type="text"
                          value={motifVirement}
                          onChange={(e) => setMotifVirement(e.target.value)}
                          placeholder="Motif (ex: Virement ponctuel)"
                          className="w-full text-sm font-medium text-gray-800 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-white border-t border-gray-100">
                    <button
                      onClick={() => handleVirementViewSwitch('etape3')}
                      className="w-full bg-[#eb5545] text-white font-extrabold py-4 rounded-2xl text-[15px] shadow-md hover:bg-red-600 transition cursor-pointer"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: ÉTAPE 3/4 (Type d'ordre) ================= */}
              {virementView === 'etape3' && (
                <div className="h-full flex flex-col bg-white">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button onClick={() => handleVirementViewSwitch('etape2')} className="text-gray-800 hover:text-[#eb5545]">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Virement</h2>
                    <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#eb5545]"
                            strokeDasharray="75, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900 text-sm">
                          3/4
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base leading-snug">Type du virement</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Etape Suivante: Confirmation</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-gray-500 font-bold text-sm mb-3">Type d'ordre</h4>
                      <div className="flex items-center space-x-6 mb-6">
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="type-ordre"
                            checked={typeOrdre === 'simple'}
                            onChange={() => setTypeOrdre('simple')}
                            className="w-5 h-5 accent-[#eb5545]"
                          />
                          <span className="text-sm font-bold text-gray-800">Ordre simple</span>
                        </label>
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="type-ordre"
                            checked={typeOrdre === 'permanent'}
                            onChange={() => setTypeOrdre('permanent')}
                            className="w-5 h-5 accent-[#eb5545]"
                          />
                          <span className="text-sm font-bold text-gray-800">Ordre permanent</span>
                        </label>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between focus-within:border-[#eb5545] transition">
                        <div>
                          <label className="block text-[11px] text-gray-400 font-medium">Date d'exécution</label>
                          <input
                            type="text"
                            value={dateExecution}
                            onChange={(e) => setDateExecution(e.target.value)}
                            className="w-full text-sm font-bold text-gray-800 outline-none mt-0.5 bg-transparent"
                          />
                        </div>
                        <Clock className="w-6 h-6 text-[#eb5545]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-white border-t border-gray-100">
                    <button
                      onClick={() => handleVirementViewSwitch('etape4')}
                      className="w-full bg-[#eb5545] text-white font-extrabold py-4 rounded-2xl text-[15px] shadow-md hover:bg-red-600 transition cursor-pointer"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: ÉTAPE 4/4 (Confirmation) ================= */}
              {virementView === 'etape4' && (
                <div className="h-full flex flex-col bg-white">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button onClick={() => handleVirementViewSwitch('etape3')} className="text-gray-800 hover:text-[#eb5545]">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Virement</h2>
                    <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#eb5545]"
                            strokeDasharray="100, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900 text-xs">
                          4/4
                        </div>
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-base">Confirmation</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-black text-[#eb5545] tracking-tight">
                        {montantVirement} DH
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-bold">Confirmez-vous les données suivantes ?</p>

                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-4 space-y-3 relative">
                      <div>
                        <span className="block text-[11px] text-gray-400 font-medium">Compte émetteur</span>
                        <span className="block text-xs font-mono font-bold text-gray-800 mt-0.5">
                          {selectedCompteEmetteur.rib}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-gray-50">
                        <span className="block text-[11px] text-gray-400 font-medium">Bénéficiaire</span>
                        <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                          {selectedBeneficiaire?.nom}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-4 space-y-3 relative">
                      <div>
                        <span className="block text-[11px] text-gray-400 font-medium">Date d'exécution</span>
                        <span className="block text-xs font-bold text-gray-800 mt-0.5">{dateExecution}</span>
                      </div>
                    </div>

                    <div className="bg-[#fef3c7] border border-[#fde68a] rounded-2xl p-3.5 flex items-start space-x-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                        Les virements entre comptes Attijariwafa bank sont gratuits et crédités instantanément.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-gray-100">
                    <button
                      onClick={() => {
                        setOtpFlow('virement');
                        setOtpReturnView('etape4');
                        setOtpCode('');
                        setOtpError('');
                        handleVirementViewSwitch('otp');
                      }}
                      className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-[15px] shadow-md hover:bg-red-600 transition cursor-pointer"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: ATTIJARI SECURE (Code PIN) ================= */}
              {virementView === 'secure' && (
                <div className="h-full flex flex-col bg-white justify-between">
                  <div>
                    <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                      <button onClick={() => handleVirementViewSwitch('etape4')} className="text-gray-800 hover:text-[#eb5545]">
                        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 tracking-tight">Attijari Secure</h2>
                      <div className="w-6"></div>
                    </div>

                    <div className="px-5 pt-6 pb-2 text-center">
                      <div className="flex justify-center mb-2">
                        <ShieldCheck className="w-10 h-10 text-[#eb5545]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Code PIN</h3>
                      <p className="text-xs text-gray-500 mt-1">Veuillez saisir votre code PIN à 6 chiffres</p>

                      <div className="flex justify-center space-x-2 my-5">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <div
                            key={idx}
                            className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-2xl text-gray-800 bg-white shadow-sm ${
                              currentPin.length > idx ? 'border-[#eb5545] text-[#eb5545]' : 'border-gray-200'
                            }`}
                          >
                            {currentPin.length > idx ? '•' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-3 max-w-[320px] mx-auto mb-3">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => handlePinAppend(digit)}
                          className="bg-white py-3.5 rounded-xl font-bold text-lg text-gray-800 shadow-sm hover:bg-gray-100 active:scale-95 transition"
                        >
                          {digit}
                        </button>
                      ))}
                      <button className="text-xs font-bold text-[#eb5545] flex items-center justify-center">
                        PIN oublié
                      </button>
                      <button
                        onClick={() => handlePinAppend('0')}
                        className="bg-white py-3.5 rounded-xl font-bold text-lg text-gray-800 shadow-sm hover:bg-gray-100 active:scale-95 transition"
                      >
                        0
                      </button>
                      <button
                        onClick={handlePinDelete}
                        className="bg-white py-3.5 rounded-xl flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-100 active:scale-95 transition"
                      >
                        ⌫
                      </button>
                    </div>

                    <div className="max-w-[320px] mx-auto">
                      <button
                        onClick={handleConfirmPin}
                        className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-[15px] shadow-md hover:bg-red-600 transition"
                      >
                        Confirmer la transaction
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= VIEW: REÇU DE SUCCÈS ================= */}
              {virementView === 'succes' && (
                <div className="h-full flex flex-col bg-white justify-between">
                  <div>
                    <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                      <div className="w-6"></div>
                      <h2 className="text-lg font-bold text-gray-900 tracking-tight">Virement</h2>
                      <button onClick={() => handleTabSwitch('dashboard')} className="text-[#eb5545]">
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="px-4 pt-5 pb-4 space-y-4">
                      <div className="bg-[#e7f8ef] rounded-3xl p-6 text-center relative shadow-sm border border-[#c1edd4]">
                        <div className="flex justify-center mb-3">
                          <CheckCircle2 className="w-14 h-14 text-[#10b981]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 leading-snug">
                          Opération effectuée
                          <br />
                          avec succès
                        </h3>

                        <div className="border-t border-dashed border-[#b6e8cb] my-5 mx-2"></div>
                        <div className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                          {montantVirement} DH
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          Votre virement à {selectedBeneficiaire?.nom} a été pris en charge.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:bg-gray-50 transition">
                          <Share2 className="w-6 h-6 text-[#eb5545] mb-1.5" />
                          <span className="text-xs font-bold text-[#eb5545]">Partager</span>
                        </button>
                        <button className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:bg-gray-50 transition">
                          <Heart className="w-6 h-6 text-[#eb5545] mb-1.5" />
                          <span className="text-xs font-bold text-[#eb5545]">Ajouter aux favoris</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleVirementViewSwitch('mes-virements');
                        setMesVirementsSubTab('traites');
                      }}
                      className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-[15px] shadow-md hover:bg-red-600 transition"
                    >
                      Voir les virements traités
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: GESTION DES BÉNÉFICIAIRES ================= */}
              {virementView === 'beneficiaires' && (
                <div className="h-full flex flex-col bg-white relative">
                  <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
                    <button onClick={() => handleVirementViewSwitch('etape1')} className="text-[#eb5545] p-1 -ml-1">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gestion des bénéficiaires</h2>
                    <button
                      onClick={() => setShowSearchBeneficiaire(!showSearchBeneficiaire)}
                      className="text-[#eb5545] p-1 -mr-1 hover:opacity-80"
                      title="Rechercher un bénéficiaire"
                    >
                      <Search className="w-6 h-6 stroke-[2]" />
                    </button>
                  </div>

                  {showSearchBeneficiaire && (
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou RIB..."
                        value={searchBeneficiaireQuery}
                        onChange={(e) => setSearchBeneficiaireQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        autoFocus
                      />
                      {searchBeneficiaireQuery && (
                        <button
                          onClick={() => setSearchBeneficiaireQuery('')}
                          className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 pb-24 divide-y divide-gray-100">
                    {beneficiairesList
                      .filter(
                        (b) =>
                          b.nom.toLowerCase().includes(searchBeneficiaireQuery.toLowerCase()) ||
                          b.rib.includes(searchBeneficiaireQuery)
                      )
                      .map((b) => (
                        <div
                          key={b.rib}
                          onClick={() => {
                            setSelectedBeneficiaire(b);
                            handleVirementViewSwitch('etape1');
                          }}
                          className="py-3.5 flex items-start justify-between cursor-pointer hover:bg-gray-50 rounded-xl px-1.5 transition"
                        >
                          <div className="flex items-start space-x-3.5">
                            {/* Avatar with Bank Badge */}
                            <div className="relative shrink-0 mt-0.5">
                              <div
                                className={`w-12 h-12 rounded-full ${b.color} text-white flex items-center justify-center font-bold text-base shadow-sm`}
                              >
                                {b.initials}
                              </div>
                              {/* Badge Banque */}
                              {b.badgeType === 'attijari' ? (
                                <div
                                  className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#f08b00] border-2 border-white flex items-center justify-center shadow-sm"
                                  title="Attijariwafa bank"
                                >
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none">
                                    <path
                                      d="M2 9L5 6L8 9.5L11 6L14 9"
                                      stroke="#7a1000"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <div
                                  className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                                  title="Autre banque"
                                >
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none">
                                    <path
                                      d="M4 8h5l3-3.5"
                                      stroke="#0ea5e9"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M9 8l3 3.5"
                                      stroke="#f97316"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div>
                              <h4 className="font-extrabold text-[#1e293b] text-[15px] sm:text-base leading-snug tracking-tight">
                                {b.nom}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5 leading-snug">
                                {['Mohamed Allam', 'Mouhssine Belaicha', 'Mohamed Malih'].includes(b.nom) ? (
                                  <>
                                    RIB:{' '}
                                    <span className="font-mono text-gray-700 text-[13px] tracking-tight">{b.rib}</span>
                                  </>
                                ) : (
                                  <>
                                    RIB:
                                    <span className="block font-mono text-gray-700 text-[13px] tracking-wide mt-0.5">
                                      {b.rib}
                                    </span>
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 font-medium mt-1">Date d'ajout: {b.dateAjout}</p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="text-[#eb5545] font-bold text-xl px-1.5 py-0.5 hover:opacity-80"
                          >
                            ⋮
                          </button>
                        </div>
                      ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-6">
                    <button
                      onClick={() => handleVirementViewSwitch('ajouter-beneficiaire')}
                      className="w-full bg-[#eb5545] text-white font-bold py-3.5 rounded-full text-[15px] shadow-md hover:bg-red-600 transition"
                    >
                      Ajouter un bénéficiaire
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: AJOUTER UN BÉNÉFICIAIRE ================= */}
              {virementView === 'ajouter-beneficiaire' && (
                <div className="h-full flex flex-col bg-white relative">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button onClick={() => handleVirementViewSwitch('beneficiaires')} className="text-[#eb5545]">
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ajouter un bénéficiaire</h2>
                    <div className="w-6"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-24">
                    <div className="flex justify-center mb-1">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-inner">
                        <User className="w-12 h-12" />
                      </div>
                    </div>

                    <div className="relative bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="block text-[11px] text-gray-400 font-medium">Type</span>
                        <span className="block text-sm font-medium text-gray-800 mt-0.5">Personne physique</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-[#eb5545]" />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <label className="block text-[11px] text-gray-400 font-medium">Nom du bénéficiaire</label>
                      <input
                        type="text"
                        value={nouveauNom}
                        onChange={(e) => setNouveauNom(e.target.value)}
                        placeholder="Ex: ABALLAGH"
                        className="w-full text-sm font-medium text-gray-800 outline-none mt-0.5 bg-transparent uppercase"
                      />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <label className="block text-[11px] text-gray-400 font-medium">Prénom du bénéficiaire</label>
                      <input
                        type="text"
                        value={nouveauPrenom}
                        onChange={(e) => setNouveauPrenom(e.target.value)}
                        placeholder="Ex: ABDERRAHIM"
                        className="w-full text-sm font-medium text-gray-800 outline-none mt-0.5 bg-transparent"
                      />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <label className="block text-[11px] text-gray-400 font-medium">RIB (24 chiffres)</label>
                      <input
                        type="text"
                        value={nouveauRib}
                        onChange={(e) => setNouveauRib(e.target.value)}
                        placeholder="007450000713330040278206"
                        className="w-full text-sm font-mono font-medium text-gray-800 outline-none mt-0.5 bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
                    <button
                      onClick={() => {
                        if (!nouveauNom || !nouveauRib) {
                          alert('Veuillez remplir le nom et le RIB.');
                          return;
                        }
                        const fullName = `${nouveauPrenom} ${nouveauNom}`.trim();
                        const initials = (nouveauPrenom[0] || nouveauNom[0] || 'B').toUpperCase() + (nouveauNom[0] || 'N').toUpperCase();
                        const newB: Beneficiaire = {
                          nom: fullName,
                          rib: nouveauRib,
                          initials,
                          color: 'bg-[#00a884]',
                          dateAjout: "Aujourd'hui",
                          hasFeather: true,
                        };
                        setPendingBeneficiaire(newB);
                        setOtpFlow('beneficiaire');
                        setOtpReturnView('ajouter-beneficiaire');
                        setOtpCode('');
                        setOtpError('');
                        handleVirementViewSwitch('otp');
                      }}
                      className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-[15px] shadow hover:bg-red-600 transition cursor-pointer"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW: OTP (Code de confirmation par SMS) ================= */}
              {virementView === 'otp' && (
                <div className="h-full flex flex-col bg-white">
                  {/* Header avec flèche rouge et titre OTP centré */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
                    <button
                      onClick={() => handleVirementViewSwitch(otpReturnView || 'etape1')}
                      className="text-[#eb5545] p-1 -ml-1 hover:opacity-80 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">OTP</h2>
                    <div className="w-6"></div>
                  </div>

                  {/* Corps du formulaire OTP */}
                  <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 flex flex-col items-center">
                    {/* Illustration Téléphone + Bulle de message SMS exactement comme la photo */}
                    <div className="w-24 h-24 flex items-center justify-center mb-6 relative">
                      <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none">
                        {/* Smartphone contour orange/rouge */}
                        <rect x="22" y="16" width="34" height="52" rx="6" stroke="#eb5545" strokeWidth="3" fill="none" />
                        {/* Ligne écouteur en haut */}
                        <line x1="33" y1="22" x2="45" y2="22" stroke="#eb5545" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Barre inférieure */}
                        <line x1="30" y1="62" x2="48" y2="62" stroke="#eb5545" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Bulle SMS orange/jaune en haut à droite avec pointe vers le téléphone */}
                        <path
                          d="M44 14 C44 9 48 5 53 5 H65 C70 5 74 9 74 14 V25 C74 30 70 34 65 34 H55 L47 41 V34 H53 C48 34 44 30 44 25 Z"
                          stroke="#f59e0b"
                          strokeWidth="3"
                          fill="white"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                        {/* 3 points rouges dans la bulle de message */}
                        <circle cx="53" cy="19" r="2.2" fill="#eb5545" />
                        <circle cx="59" cy="19" r="2.2" fill="#eb5545" />
                        <circle cx="65" cy="19" r="2.2" fill="#eb5545" />
                      </svg>
                    </div>

                    {/* Titre Code de confirmation */}
                    <h3 className="text-2xl font-black text-[#1e293b] mb-3 text-center tracking-tight">
                      Code de confirmation
                    </h3>

                    {/* Sous-titre numéro masqué */}
                    <p className="text-[15px] text-gray-500 font-medium text-center max-w-[280px] leading-relaxed mb-8">
                      Un code de vérification a été envoyé au numéro *******2546.
                    </p>

                    {/* Champ Code encadré de rouge */}
                    <div className="w-full max-w-sm mb-2">
                      <div
                        className={`border-2 ${
                          otpError ? 'border-red-500' : 'border-[#eb5545]'
                        } rounded-2xl px-4 pt-2.5 pb-2.5 bg-white relative transition shadow-2xs`}
                      >
                        <label className="block text-xs font-bold text-[#eb5545] leading-none mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value);
                            if (otpError) setOtpError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleValidateOtp();
                          }}
                          placeholder=""
                          className="w-full text-base font-bold text-gray-900 outline-none bg-transparent"
                          autoFocus
                        />
                      </div>

                      {/* Message d'erreur si code erroné */}
                      {otpError && (
                        <div className="text-left mt-2 px-1 animate-in fade-in duration-150">
                          <p className="text-xs font-bold text-red-500">{otpError}</p>
                        </div>
                      )}
                    </div>

                    {/* Bouton Valider */}
                    <div className="w-full max-w-sm mt-8">
                      <button
                        type="button"
                        onClick={handleValidateOtp}
                        disabled={!otpCode.trim()}
                        className={`w-full py-4 rounded-2xl font-black text-[16px] transition ${
                          otpCode.trim().length > 0
                            ? 'bg-[#eb5545] text-white hover:bg-red-600 shadow-md cursor-pointer active:scale-[0.99]'
                            : 'bg-[#edf2f7] text-[#94a3b8] cursor-not-allowed'
                        }`}
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 6: MENU ===================== */}
        {activeTab === 'menu' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-xl mx-auto w-full animate-in fade-in duration-200">
            {/* 1. Header Utilisateur */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3.5">
                {/* Avatar AS bleu */}
                <div className="w-12 h-12 rounded-full bg-[#00a2e8] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                  AS
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">SABER</h2>
                    <ArrowRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Dernière connexion: 10/11/2026 (00h09)
                  </p>
                </div>
              </div>

              {/* Bouton Power Déconnexion rouge */}
              <button
                onClick={() => executeWithLoading(() => setIsLoggedIn(false), 500)}
                className="w-11 h-11 rounded-full bg-[#eb5545] text-white flex items-center justify-center shadow-md hover:bg-red-600 transition active:scale-95 shrink-0"
                title="Déconnexion"
              >
                <Power className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* 2. Barre de Recherche Pilule */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Recherche ..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-full py-3.5 pl-5 pr-12 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#eb5545]"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. Carte Bannière "Découvrez nos produits et services" */}
            <div
              onClick={() =>
                setPromoModal({
                  title: 'Produits et services',
                  subtitle: 'Attijariwafa bank',
                  content:
                    'Découvrez l’ensemble de nos offres dédiées aux professionnels : packs bancaires, financements express, solutions de paiement dématérialisées et services d’assurance.',
                })
              }
              className="bg-white border border-gray-100/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition mb-6 active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3.5 pr-2">
                <div className="w-11 h-11 rounded-full bg-[#eb5545] text-white flex items-center justify-center shrink-0 shadow-sm">
                  {/* Icône Fusée */}
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-[#1e293b] text-[15px] sm:text-base leading-snug">
                  Découvrez nos produits et services
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5] shrink-0" />
            </div>

            {/* 4. Section "Fréquemment utilisées" */}
            {(!menuSearchQuery || 'fréquemment utilisées recharge rib virement cartes'.includes(menuSearchQuery.toLowerCase())) && (
              <div className="mb-6">
                <h3 className="font-extrabold text-[#1e293b] text-[17px] mb-3">
                  Fréquemment utilisées
                </h3>
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {/* 1. Recharge mobile et ... */}
                  <div
                    onClick={() =>
                      setPromoModal({
                        title: 'Recharge mobile et factures',
                        subtitle: 'Paiements rapides',
                        content:
                          'Rechargez votre forfait Maroc Telecom, Orange ou inwi en quelques secondes directement depuis votre compte.',
                      })
                    }
                    className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-2.5 sm:p-3 aspect-square flex flex-col items-center justify-between cursor-pointer hover:border-[#eb5545] transition active:scale-95 text-center group"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-[#eb5545]">
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="5" y="2" width="14" height="20" rx="3" />
                          <rect x="2" y="7" width="10" height="7" rx="1.5" className="fill-white stroke-[#eb5545]" />
                          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#eb5545] leading-tight">
                      Recharge mobile et ...
                    </span>
                  </div>

                  {/* 2. Mon RIB */}
                  <div
                    onClick={() => setShowRibModal(true)}
                    className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-2.5 sm:p-3 aspect-square flex flex-col items-center justify-between cursor-pointer hover:border-[#eb5545] transition active:scale-95 text-center group"
                  >
                    <div className="flex-1 flex items-center justify-center text-[#eb5545]">
                      <QrCode className="w-7 h-7 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#eb5545] leading-tight">
                      Mon RIB
                    </span>
                  </div>

                  {/* 3. Virement */}
                  <div
                    onClick={() => {
                      handleTabSwitch('virements');
                      handleVirementViewSwitch('etape1');
                    }}
                    className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-2.5 sm:p-3 aspect-square flex flex-col items-center justify-between cursor-pointer hover:border-[#eb5545] transition active:scale-95 text-center group"
                  >
                    <div className="flex-1 flex items-center justify-center text-[#eb5545]">
                      <svg className="w-7 h-7 text-[#eb5545]" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 9H8M12 5L8 9L12 13" />
                        <path d="M7 18H20M16 14L20 18L16 22" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-[#eb5545] leading-tight">
                      Virement
                    </span>
                  </div>

                  {/* 4. Mes cartes */}
                  <div
                    onClick={() => handleTabSwitch('cartes')}
                    className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl p-2.5 sm:p-3 aspect-square flex flex-col items-center justify-between cursor-pointer hover:border-[#eb5545] transition active:scale-95 text-center group"
                  >
                    <div className="flex-1 flex items-center justify-center text-[#eb5545]">
                      <CreditCard className="w-7 h-7 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#eb5545] leading-tight">
                      Mes cartes
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Cartes Accordéon du Menu */}
            <div className="space-y-3">
              {/* 1. Consultation */}
              {(!menuSearchQuery || 'consultation comptes solde pro'.includes(menuSearchQuery.toLowerCase())) && (
                <div className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden transition">
                  <div
                    onClick={() => setMenuConsultationOpen(!menuConsultationOpen)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                        {/* Icône personne avec loupe */}
                        <svg className="w-5 h-5 text-[#eb5545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="10" cy="8" r="4" />
                          <path d="M3 20c0-3.5 3-6 7-6" />
                          <circle cx="17" cy="17" r="3" />
                          <line x1="19.2" y1="19.2" x2="22" y2="22" />
                        </svg>
                      </div>
                      <span className="font-extrabold text-[#1e293b] text-base">
                        Consultation
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#eb5545] stroke-[2.5] transition-transform duration-200 ${
                        menuConsultationOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {menuConsultationOpen && (
                    <div className="px-5 pb-3 pt-1 border-t border-gray-100 space-y-2.5 text-sm bg-gray-50/40">
                      <div
                        onClick={() => handleTabSwitch('comptes')}
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition"
                      >
                        <span>Mes comptes & soldes</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() => handleTabSwitch('transactions-pro')}
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <span>Compte Professionnel (158 747,57 MAD)</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() =>
                          setPromoModal({
                            title: 'Relevés et avis',
                            subtitle: 'Documents bancaires',
                            content:
                              'Téléchargez vos relevés de compte mensuels et attestations de solde au format PDF certifié.',
                          })
                        }
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <span>Relevés et avis bancaires</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Paiements et transferts (avec point rouge) */}
              {(!menuSearchQuery || 'paiements transferts virement bénéficiaires facture'.includes(menuSearchQuery.toLowerCase())) && (
                <div className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden transition">
                  <div
                    onClick={() => setMenuPaiementsOpen(!menuPaiementsOpen)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                        {/* Icône transfert monétaire */}
                        <svg className="w-5 h-5 text-[#eb5545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="7" />
                          <path d="M12 9v6M9 12h6" />
                          <path d="M5 8l-2 4 2 4" />
                          <path d="M19 8l2 4-2 4" />
                        </svg>
                        {/* Pastille rouge */}
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#eb5545] rounded-full border-2 border-white"></span>
                      </div>
                      <span className="font-extrabold text-[#1e293b] text-base">
                        Paiements et transferts
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#eb5545] stroke-[2.5] transition-transform duration-200 ${
                        menuPaiementsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {menuPaiementsOpen && (
                    <div className="px-5 pb-3 pt-1 border-t border-gray-100 space-y-2.5 text-sm bg-gray-50/40">
                      <div
                        onClick={() => {
                          handleTabSwitch('virements');
                          handleVirementViewSwitch('etape1');
                        }}
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition"
                      >
                        <span>Effectuer un virement</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() => {
                          handleTabSwitch('virements');
                          handleVirementViewSwitch('mes-virements');
                          setMesVirementsSubTab('traites');
                        }}
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Historique des virements traités</span>
                          <span className="text-[10px] bg-red-100 text-[#eb5545] font-black px-1.5 py-0.5 rounded-full">18</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() => {
                          handleTabSwitch('virements');
                          handleVirementViewSwitch('beneficiaires');
                        }}
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <span>Gestion des bénéficiaires</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() =>
                          setPromoModal({
                            title: 'Paiement de factures',
                            subtitle: 'Services partenaires',
                            content:
                              'Réglez vos factures d’eau, d’électricité (Lydec, Redal, Amendis, ONEE), télécoms et impôts en direct.',
                          })
                        }
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <span>Paiement de factures</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Epargne et placement (avec point rouge) */}
              {(!menuSearchQuery || 'epargne placement carnet compte'.includes(menuSearchQuery.toLowerCase())) && (
                <div className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden transition">
                  <div
                    onClick={() => setMenuEpargneOpen(!menuEpargneOpen)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                        <Sprout className="w-5 h-5 text-[#eb5545]" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#eb5545] rounded-full border-2 border-white"></span>
                      </div>
                      <span className="font-extrabold text-[#1e293b] text-base">
                        Epargne et placement
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#eb5545] stroke-[2.5] transition-transform duration-200 ${
                        menuEpargneOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {menuEpargneOpen && (
                    <div className="px-5 pb-3 pt-1 border-t border-gray-100 space-y-2.5 text-sm bg-gray-50/40">
                      <div
                        onClick={() =>
                          setPromoModal({
                            title: 'Comptes sur carnet',
                            subtitle: 'Epargne rémunérée',
                            content:
                              'Constituez votre épargne de sécurité à votre rythme avec une rémunération trimestrielle garantie.',
                          })
                        }
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition"
                      >
                        <span>Comptes sur carnet</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div
                        onClick={() =>
                          setPromoModal({
                            title: 'Dépôts à terme',
                            subtitle: 'Placement à terme',
                            content:
                              'Bloquez vos excédents de trésorerie sur une durée de 3 à 24 mois pour un rendement optimal.',
                          })
                        }
                        className="py-2 flex items-center justify-between cursor-pointer font-bold text-gray-700 hover:text-[#eb5545] transition border-t border-gray-100"
                      >
                        <span>Dépôts à terme (DAT)</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Crédits (avec point rouge) */}
              {(!menuSearchQuery || 'crédits pret financement'.includes(menuSearchQuery.toLowerCase())) && (
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Crédits et Financements',
                      subtitle: 'Solutions aux professionnels',
                      content:
                        'Simulez et suivez vos demandes de crédit auto-entrepreneur, crédit d’équipement ou facilité de caisse avec réponse sous 48h.',
                    })
                  }
                  className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5 text-[#eb5545]" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#eb5545] rounded-full border-2 border-white"></span>
                    </div>
                    <span className="font-extrabold text-[#1e293b] text-base">
                      Crédits
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                </div>
              )}

              {/* 5. Assurance et assistance */}
              {(!menuSearchQuery || 'assurance assistance securicarte voyage'.includes(menuSearchQuery.toLowerCase())) && (
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Assurance et assistance',
                      subtitle: 'Protection complète',
                      content:
                        'Découvrez nos assurances santé, assistance voyage et protection Securicarte en cas de perte ou vol de vos moyens de paiement.',
                    })
                  }
                  className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                      <Umbrella className="w-5 h-5 text-[#eb5545]" />
                    </div>
                    <span className="font-extrabold text-[#1e293b] text-base">
                      Assurance et assistance
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                </div>
              )}

              {/* 6. Aide et support (avec point rouge) */}
              {(!menuSearchQuery || 'aide support contact assistance'.includes(menuSearchQuery.toLowerCase())) && (
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Aide et support',
                      subtitle: 'Centre de relation client',
                      content:
                        'Besoin d’assistance ? Contactez nos conseillers au 0522 58 88 58 du lundi au vendredi de 8h à 19h et le samedi de 9h à 15h.',
                    })
                  }
                  className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#eb5545]" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#eb5545] rounded-full border-2 border-white"></span>
                    </div>
                    <span className="font-extrabold text-[#1e293b] text-base">
                      Aide et support
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                </div>
              )}

              {/* 7. Paramètres (avec point rouge) */}
              {(!menuSearchQuery || 'paramètres sécurité mot de passe profil'.includes(menuSearchQuery.toLowerCase())) && (
                <div
                  onClick={() =>
                    setPromoModal({
                      title: 'Paramètres du compte',
                      subtitle: 'Sécurité et préférences',
                      content:
                        'Gérez la biométrie (Touch ID / Face ID), la modification du mot de passe, les plafonds de virement et vos préférences de notification.',
                    })
                  }
                  className="bg-white border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-200 transition active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="relative w-11 h-11 rounded-full bg-[#fde8e6] text-[#eb5545] flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5 text-[#eb5545]" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#eb5545] rounded-full border-2 border-white"></span>
                    </div>
                    <span className="font-extrabold text-[#1e293b] text-base">
                      Paramètres
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#eb5545] stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* 6. Version en bas */}
            <p className="text-center font-bold text-gray-400 text-sm mt-8 mb-4">
              Version 6.13.2
            </p>
          </div>
        )}
      </main>

      {/* MODAL NOTIFICATIONS */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full h-[90vh] max-h-[700px] shadow-2xl flex flex-col overflow-hidden relative">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-[#eb5545] p-1 hover:bg-red-50 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-extrabold text-[#221f3b] tracking-tight">Notifications</h2>
              <div className="flex items-center space-x-2">
                <button className="text-[#eb5545] p-1 hover:bg-red-50 rounded-full transition">
                  <Search className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-gray-700 mb-3 px-1">16 Oct. 2026</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between relative">
                    <div className="flex items-start space-x-3 pr-2">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white"></span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Info: Transaction monétique</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                          Transaction non aboutie, merci d'activer votre dotation ou le service à l'international.
                        </p>
                        <span className="block text-[11px] text-gray-400 font-semibold mt-2">14h51</span>
                      </div>
                    </div>
                    <button className="text-[#eb5545] font-bold text-lg px-1 shrink-0">⋮</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHOIX COMPTE ÉMETTEUR */}
      {isChoixCompteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">Choisir un compte émetteur</h3>
              <button
                onClick={() => setIsChoixCompteOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Compte chèque */}
              <div
                onClick={() => {
                  setSelectedCompteEmetteur({
                    id: 'compte-cheque',
                    title: 'Compte chèque',
                    rib: '000713N300400592',
                    solde: '3 252,54 MAD',
                  });
                  setIsChoixCompteOpen(false);
                }}
                className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition ${
                  selectedCompteEmetteur.id === 'compte-cheque'
                    ? 'border-[#eb5545] bg-red-50/20'
                    : 'border-gray-200 hover:border-[#F08B00]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#eb5545] text-white flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Compte chèque</h4>
                    <p className="text-xs text-gray-400 font-mono">000713N300400592</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  3 252,54 MAD
                </span>
              </div>

              {/* Option 2: Compte Pro */}
              <div
                onClick={() => {
                  setSelectedCompteEmetteur({
                    id: 'compte-pro',
                    title: 'Compte Professionnel',
                    rib: 'Mastercard : 5311401000460298',
                    solde: '158 747,57 DH',
                  });
                  setIsChoixCompteOpen(false);
                }}
                className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition ${
                  selectedCompteEmetteur.id === 'compte-pro'
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-gray-200 hover:border-[#F08B00]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Compte Professionnel</h4>
                    <p className="text-xs text-gray-400 font-mono">Mastercard : 5311401000460298</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  158 747,57 DH
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'information sur les offres & nouveautés */}
      {promoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setPromoModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#eb5545] flex items-center justify-center mb-4">
              <Info className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-black text-gray-900">{promoModal.title}</h3>
            <p className="text-xs text-[#eb5545] font-bold mt-0.5">{promoModal.subtitle}</p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{promoModal.content}</p>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setPromoModal(null)}
                className="flex-1 bg-[#eb5545] text-white font-bold py-3 rounded-xl text-sm shadow hover:bg-red-600 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Installation APK Android / PWA */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 flex flex-col items-center text-center">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Icone officielle de l'app icon2026.png */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md mb-3 border border-gray-100 p-0.5 bg-white">
              <img src="icon2026.png" alt="Attijari pro" className="w-full h-full object-cover rounded-xl" />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1">Installer Attijari pro (APK)</h3>
            <p className="text-xs text-gray-500 mb-5">Application Mobile Espace Auto-Entrepreneur</p>

            <div className="w-full bg-red-50/50 rounded-2xl p-4 text-left border border-red-100 mb-5 space-y-2.5">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-[#eb5545] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  <strong>Sur votre navigateur mobile (Samsung Internet / Chrome)</strong> : Ouvrez le menu ⋮ puis appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-[#eb5545] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  L'application s'installera avec l'icône <strong>icon2026.png</strong> comme une vraie application native !
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (deferredInstallPrompt) {
                  deferredInstallPrompt.prompt();
                  deferredInstallPrompt.userChoice.then(() => {
                    setDeferredInstallPrompt(null);
                    setShowInstallModal(false);
                  });
                } else {
                  alert("Pour installer l'application sur Android, appuyez sur les 3 points du navigateur puis 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
                }
              }}
              className="w-full bg-[#eb5545] text-white font-extrabold py-3.5 rounded-2xl text-sm shadow hover:bg-red-600 transition flex items-center justify-center space-x-2 cursor-pointer mb-2.5"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Installer maintenant</span>
            </button>

            <a
              href="attijari-pro-github.zip"
              download="attijari-pro-github.zip"
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center space-x-2 border border-gray-200"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Télécharger le ZIP complet pour GitHub</span>
            </a>
          </div>
        </div>
      )}

      {/* MODAL MON RIB */}
      {showRibModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRibModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#eb5545] flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-1">Mon RIB</h3>
            <p className="text-xs text-gray-400 text-center mb-5">Compte chèque - Attijariwafa bank</p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5">
              <p className="text-[11px] text-gray-400 font-bold mb-1 tracking-wider uppercase">Titulaire du compte</p>
              <p className="text-sm font-black text-gray-800 mb-3">SABER ABALLAGH</p>
              <p className="text-[11px] text-gray-400 font-bold mb-1 tracking-wider uppercase">Relevé d'Identité Bancaire</p>
              <p className="font-mono text-sm font-black text-[#eb5545] tracking-wide select-all">
                00745000071330040059200
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText('00745000071330040059200');
                alert('RIB copié dans le presse-papier !');
              }}
              className="w-full bg-[#eb5545] text-white font-bold py-3.5 rounded-full text-sm shadow hover:bg-red-600 transition"
            >
              Copier le RIB
            </button>
          </div>
        </div>
      )}

      {/* Pop-up "Que voulez-vous faire?" (Bottom Sheet exactement conforme à la capture) */}
      {showActionSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop sombre */}
          <div
            onClick={() => setShowActionSheet(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
          ></div>

          {/* Panneau blanc inférieur */}
          <div className="relative w-full max-w-lg bg-white rounded-t-[36px] p-6 sm:p-7 pb-10 z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Poignée de drag en haut */}
            <div className="flex justify-center -mt-2 mb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* En-tête : Titre "Que voulez-vous faire?" + Icône Crayon */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl sm:text-[26px] font-black text-[#1e293b] tracking-tight">
                Que voulez-vous faire?
              </h3>
              <button
                onClick={() => setShowActionSheet(false)}
                className="p-1 text-[#eb5545] hover:opacity-80 transition focus:outline-none"
                title="Personnaliser les raccourcis"
              >
                {/* Icône crayon identique à la photo */}
                <svg className="w-5 h-5 text-[#eb5545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  <line x1="15" y1="22" x2="22" y2="22" />
                </svg>
              </button>
            </div>

            {/* Grille 2x2 des 4 cartes de raccourci */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {/* 1. Virement */}
              <div
                onClick={() => {
                  setShowActionSheet(false);
                  handleTabSwitch('virements');
                  handleVirementViewSwitch('etape1');
                }}
                className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] aspect-square flex flex-col justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition active:scale-95 group"
              >
                <p className="font-bold text-gray-800 text-[16px] leading-tight group-hover:text-[#eb5545] transition">
                  Virement
                </p>
                <div className="text-[#eb5545]">
                  {/* Icône 2 flèches horizontales décalées (haut gauche ←, bas droite →) */}
                  <svg className="w-8 h-8 text-[#eb5545]" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 9H8M12 5L8 9L12 13" />
                    <path d="M7 18H20M16 14L20 18L16 22" />
                  </svg>
                </div>
              </div>

              {/* 2. Cash Express GAB & Wafac... */}
              <div
                onClick={() => {
                  setShowActionSheet(false);
                  handleTabSwitch('services');
                }}
                className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] aspect-square flex flex-col justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition active:scale-95 group"
              >
                <p className="font-bold text-gray-800 text-[16px] leading-tight group-hover:text-[#eb5545] transition whitespace-pre-line">
                  Cash Express{'\n'}GAB & Wafac...
                </p>
                <div className="text-[#eb5545]">
                  {/* Icône main tenant une pièce au dessus de la paume */}
                  <svg className="w-8 h-8 text-[#eb5545]" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="14" cy="7.5" r="3.5" />
                    <path d="M4 16h4.5l3.5 3.5h7a3.5 3.5 0 0 0 3.5-3.5v-1" />
                    <path d="M8 19.5l2 3.5h8a4 4 0 0 0 4-4" />
                  </svg>
                </div>
              </div>

              {/* 3. Paiement de factures */}
              <div
                onClick={() => {
                  setShowActionSheet(false);
                  handleTabSwitch('services');
                }}
                className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] aspect-square flex flex-col justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition active:scale-95 group"
              >
                <p className="font-bold text-gray-800 text-[16px] leading-tight group-hover:text-[#eb5545] transition whitespace-pre-line">
                  Paiement de{'\n'}factures
                </p>
                <div className="text-[#eb5545]">
                  {/* Icône facture avec bas dentelé */}
                  <svg className="w-8 h-8 text-[#eb5545]" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v20l-3-2-3 2-3-2-3 2-3-2-3 2V4z" />
                    <line x1="10" y1="8" x2="18" y2="8" />
                    <line x1="10" y1="12" x2="18" y2="12" />
                    <line x1="10" y1="16" x2="15" y2="16" />
                  </svg>
                </div>
              </div>

              {/* 4. Mes documents */}
              <div
                onClick={() => {
                  setShowActionSheet(false);
                  handleTabSwitch('services');
                }}
                className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] aspect-square flex flex-col justify-between cursor-pointer hover:border-[#eb5545] hover:shadow-md transition active:scale-95 group"
              >
                <p className="font-bold text-gray-800 text-[16px] leading-tight group-hover:text-[#eb5545] transition">
                  Mes documents
                </p>
                <div className="text-[#eb5545]">
                  {/* Icône documents superposés */}
                  <svg className="w-8 h-8 text-[#eb5545]" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
                    <rect x="7" y="8" width="13" height="15" rx="2.5" />
                    <path d="M11 13h5" />
                    <path d="M11 17h3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation inférieure Mobile (Reproduction exacte de la capture Attijari Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:left-80 bg-white border-t border-gray-100 px-4 sm:px-6 py-2 flex justify-between items-center z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-[32px]">
        {/* 1. Accueil */}
        <button
          onClick={() => handleTabSwitch('dashboard')}
          className={`w-14 sm:w-16 flex flex-col items-center justify-center focus:outline-none transition active:scale-95 ${
            activeTab === 'dashboard' || activeTab === 'detail-operation' ? 'text-[#eb5545]' : 'text-[#64748b]'
          }`}
        >
          {/* Icône maison pleine avec arche (conforme à la capture) */}
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.6L2.5 11h2.8v10h4.8v-5.2a1.9 1.9 0 0 1 3.8 0V21h4.8V11h2.8L12 2.6z" />
          </svg>
          <span className={`text-[11px] mt-1 tracking-tight ${
            activeTab === 'dashboard' || activeTab === 'detail-operation' ? 'font-bold text-[#eb5545]' : 'font-semibold text-[#64748b]'
          }`}>
            Accueil
          </span>
        </button>

        {/* 2. Comptes */}
        <button
          onClick={() => handleTabSwitch('comptes')}
          className={`w-14 sm:w-16 flex flex-col items-center justify-center focus:outline-none transition active:scale-95 ${
            activeTab === 'comptes' || activeTab === 'transactions-pro' ? 'text-[#eb5545]' : 'text-[#64748b]'
          }`}
        >
          {/* Icône portefeuille avec rabat et bouton pression (conforme à la capture) */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2" />
            <rect x="7" y="7" width="14" height="10" rx="2.5" />
            <circle cx="16" cy="12" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          <span className={`text-[11px] mt-1 tracking-tight ${
            activeTab === 'comptes' || activeTab === 'transactions-pro' ? 'font-bold text-[#eb5545]' : 'font-semibold text-[#64748b]'
          }`}>
            Comptes
          </span>
        </button>

        {/* 3. Bouton central flottant : Virement / Transfert mobile (EXACTEMENT comme dans la photo) */}
        <div className="relative -top-5 sm:-top-6 flex flex-col items-center">
          <button
            onClick={() => setShowActionSheet(!showActionSheet)}
            className="w-[62px] h-[62px] sm:w-16 sm:h-16 rounded-full bg-[#171e28] text-white flex items-center justify-center shadow-2xl shadow-black/35 border-[3.5px] border-white focus:outline-none hover:bg-black transition active:scale-90"
            title="Que voulez-vous faire?"
          >
            {/* SVG reproduisant fidèlement le téléphone, les pièces et les flèches de transfert */}
            <svg
              viewBox="0 0 48 48"
              className="w-9 h-9 sm:w-10 sm:h-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corps du smartphone */}
              <rect
                x="15"
                y="8.5"
                width="18"
                height="31"
                rx="3.5"
                stroke="white"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Haut-parleur en haut du téléphone */}
              <line
                x1="21.5"
                y1="11.5"
                x2="26.5"
                y2="11.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Pièce inférieure inclinée au centre */}
              <ellipse
                cx="21"
                cy="24.5"
                rx="3.8"
                ry="2.4"
                transform="rotate(-38 21 24.5)"
                stroke="white"
                strokeWidth="1.8"
                fill="#171e28"
              />

              {/* Pièce supérieure inclinée chevauchante */}
              <ellipse
                cx="25.5"
                cy="21.5"
                rx="3.8"
                ry="2.4"
                transform="rotate(-38 25.5 21.5)"
                stroke="white"
                strokeWidth="1.8"
                fill="#171e28"
              />

              {/* Flèche supérieure pointant vers la DROITE (→) */}
              <path
                d="M19.5 16.5H36M32 12.5L36 16.5L32 20.5"
                stroke="white"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Flèche inférieure pointant vers la GAUCHE (←) */}
              <path
                d="M28.5 30H12M16 26L12 30L16 34"
                stroke="white"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 4. Cartes */}
        <button
          onClick={() => handleTabSwitch('cartes')}
          className={`w-14 sm:w-16 flex flex-col items-center justify-center focus:outline-none transition active:scale-95 ${
            activeTab === 'cartes' ? 'text-[#eb5545]' : 'text-[#64748b]'
          }`}
        >
          {/* Icône carte bancaire (conforme à la capture) */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
            <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
          </svg>
          <span className={`text-[11px] mt-1 tracking-tight ${
            activeTab === 'cartes' ? 'font-bold text-[#eb5545]' : 'font-semibold text-[#64748b]'
          }`}>
            Cartes
          </span>
        </button>

        {/* 5. Menu */}
        <button
          onClick={() => handleTabSwitch('menu')}
          className={`w-14 sm:w-16 flex flex-col items-center justify-center focus:outline-none transition active:scale-95 ${
            activeTab === 'menu' ? 'text-[#eb5545]' : 'text-[#64748b]'
          }`}
        >
          {/* Icône grille 4 carrés arrondis 2x2 (conforme à la capture) */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill={activeTab === 'menu' ? '#eb5545' : 'none'} stroke={activeTab === 'menu' ? '#eb5545' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" />
            <rect x="14" y="3.5" width="6.5" height="6.5" rx="2" />
            <rect x="3.5" y="14" width="6.5" height="6.5" rx="2" />
            <rect x="14" y="14" width="6.5" height="6.5" rx="2" />
          </svg>
          <span className={`text-[11px] mt-1 tracking-tight ${
            activeTab === 'menu' ? 'font-bold text-[#eb5545]' : 'font-semibold text-[#64748b]'
          }`}>
            Menu
          </span>
        </button>
      </nav>
    </div>
  );
}

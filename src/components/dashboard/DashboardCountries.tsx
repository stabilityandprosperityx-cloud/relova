import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Clock } from "lucide-react";
import { countryDatabase, type CountryProfile } from "@/lib/countryMatching";
import { Button } from "@/components/ui/button";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";

const COUNTRY_RESOURCES: Record<string, {
  housing: { name: string; url: string }[];
  community: { name: string; url: string }[];
  language: { name: string; url: string }[];
}> = {
  // ─── EUROPE ───
  "Portugal": {
    housing: [
      { name: "Idealista Portugal", url: "https://www.idealista.pt" },
      { name: "Imovirtual", url: "https://www.imovirtual.com" },
      { name: "Flatio Portugal", url: "https://www.flatio.com/i/apartments-for-rent-portugal" },
    ],
    community: [
      { name: "Expats in Portugal (Facebook)", url: "https://www.facebook.com/groups/expatsinportugal" },
      { name: "r/PorugalExpats (Reddit)", url: "https://www.reddit.com/r/portugaleexpats" },
      { name: "InterNations Portugal", url: "https://www.internations.org/portugal-expats" },
    ],
    language: [
      { name: "Duolingo Portuguese", url: "https://www.duolingo.com/course/pt/en/Learn-Portuguese" },
      { name: "italki Portuguese tutors", url: "https://www.italki.com/en/teachers/portuguese" },
      { name: "Preply Portuguese", url: "https://preply.com/en/learn/portuguese" },
    ],
  },
  "Spain": {
    housing: [
      { name: "Idealista Spain", url: "https://www.idealista.com" },
      { name: "Fotocasa", url: "https://www.fotocasa.es" },
      { name: "Flatio Spain", url: "https://www.flatio.com/i/apartments-for-rent-spain" },
    ],
    community: [
      { name: "Expats in Spain (Facebook)", url: "https://www.facebook.com/groups/expatsinspain" },
      { name: "r/SpainExpats (Reddit)", url: "https://www.reddit.com/r/SpainExpats" },
      { name: "InterNations Spain", url: "https://www.internations.org/spain-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Cervantes Institute", url: "https://www.cervantes.es/en/default.shtm" },
    ],
  },
  "Germany": {
    housing: [
      { name: "ImmobilienScout24", url: "https://www.immobilienscout24.de" },
      { name: "WG-Gesucht (flatshares)", url: "https://www.wg-gesucht.de" },
      { name: "Flatio Germany", url: "https://www.flatio.com/i/apartments-for-rent-germany" },
    ],
    community: [
      { name: "Expats in Germany (Facebook)", url: "https://www.facebook.com/groups/expatsingermany" },
      { name: "r/germany (Reddit)", url: "https://www.reddit.com/r/germany" },
      { name: "InterNations Germany", url: "https://www.internations.org/germany-expats" },
    ],
    language: [
      { name: "Duolingo German", url: "https://www.duolingo.com/course/de/en/Learn-German" },
      { name: "Goethe Institut", url: "https://www.goethe.de/en/index.html" },
      { name: "italki German tutors", url: "https://www.italki.com/en/teachers/german" },
    ],
  },
  "Austria": {
    housing: [
      { name: "Willhaben", url: "https://www.willhaben.at/iad/immobilien/mietwohnungen" },
      { name: "ImmoScout24 Austria", url: "https://www.immoscout24.at" },
      { name: "Flatio Austria", url: "https://www.flatio.com/i/apartments-for-rent-austria" },
    ],
    community: [
      { name: "Expats in Vienna (Facebook)", url: "https://www.facebook.com/groups/expatsinvienna" },
      { name: "r/austria (Reddit)", url: "https://www.reddit.com/r/austria" },
      { name: "InterNations Vienna", url: "https://www.internations.org/vienna-expats" },
    ],
    language: [
      { name: "Duolingo German", url: "https://www.duolingo.com/course/de/en/Learn-German" },
      { name: "Volkshochschule Wien", url: "https://www.vhs.at/en" },
      { name: "italki German tutors", url: "https://www.italki.com/en/teachers/german" },
    ],
  },
  "Italy": {
    housing: [
      { name: "Idealista Italy", url: "https://www.idealista.it" },
      { name: "Immobiliare.it", url: "https://www.immobiliare.it" },
      { name: "Flatio Italy", url: "https://www.flatio.com/i/apartments-for-rent-italy" },
    ],
    community: [
      { name: "Expats in Italy (Facebook)", url: "https://www.facebook.com/groups/expatsinitaly" },
      { name: "r/ItalyExpats (Reddit)", url: "https://www.reddit.com/r/ItalyExpats" },
      { name: "InterNations Italy", url: "https://www.internations.org/italy-expats" },
    ],
    language: [
      { name: "Duolingo Italian", url: "https://www.duolingo.com/course/it/en/Learn-Italian" },
      { name: "italki Italian tutors", url: "https://www.italki.com/en/teachers/italian" },
      { name: "Società Dante Alighieri", url: "https://ladante.it/en" },
    ],
  },
  "France": {
    housing: [
      { name: "SeLoger", url: "https://www.seloger.com" },
      { name: "PAP.fr", url: "https://www.pap.fr" },
      { name: "Flatio France", url: "https://www.flatio.com/i/apartments-for-rent-france" },
    ],
    community: [
      { name: "Expats in France (Facebook)", url: "https://www.facebook.com/groups/expatsinfrance" },
      { name: "r/FranceExpats (Reddit)", url: "https://www.reddit.com/r/FranceExpats" },
      { name: "InterNations France", url: "https://www.internations.org/france-expats" },
    ],
    language: [
      { name: "Duolingo French", url: "https://www.duolingo.com/course/fr/en/Learn-French" },
      { name: "Alliance Française", url: "https://www.alliancefr.org" },
      { name: "italki French tutors", url: "https://www.italki.com/en/teachers/french" },
    ],
  },
  "Netherlands": {
    housing: [
      { name: "Funda", url: "https://www.funda.nl" },
      { name: "Pararius", url: "https://www.pararius.com" },
      { name: "Flatio Netherlands", url: "https://www.flatio.com/i/apartments-for-rent-netherlands" },
    ],
    community: [
      { name: "Expats in Netherlands (Facebook)", url: "https://www.facebook.com/groups/expatsinthenetherlands" },
      { name: "r/Netherlands (Reddit)", url: "https://www.reddit.com/r/Netherlands" },
      { name: "InterNations Amsterdam", url: "https://www.internations.org/amsterdam-expats" },
    ],
    language: [
      { name: "Duolingo Dutch", url: "https://www.duolingo.com/course/nl/en/Learn-Dutch" },
      { name: "italki Dutch tutors", url: "https://www.italki.com/en/teachers/dutch" },
      { name: "NT2 Dutch courses", url: "https://www.nt2.nl" },
    ],
  },
  "Greece": {
    housing: [
      { name: "Spitogatos", url: "https://www.spitogatos.gr" },
      { name: "XE.gr Real Estate", url: "https://www.xe.gr/property" },
      { name: "Flatio Greece", url: "https://www.flatio.com/i/apartments-for-rent-greece" },
    ],
    community: [
      { name: "Expats in Greece (Facebook)", url: "https://www.facebook.com/groups/expatsingreece" },
      { name: "r/greece (Reddit)", url: "https://www.reddit.com/r/greece" },
      { name: "InterNations Athens", url: "https://www.internations.org/athens-expats" },
    ],
    language: [
      { name: "Duolingo Greek", url: "https://www.duolingo.com/course/el/en/Learn-Greek" },
      { name: "italki Greek tutors", url: "https://www.italki.com/en/teachers/greek" },
      { name: "Greek Language Schools", url: "https://www.greeklanguage.gr" },
    ],
  },
  "Croatia": {
    housing: [
      { name: "Njuškalo Nekretnine", url: "https://www.njuskalo.hr/nekretnine" },
      { name: "Crozilla", url: "https://www.crozilla.com" },
      { name: "Flatio Croatia", url: "https://www.flatio.com/i/apartments-for-rent-croatia" },
    ],
    community: [
      { name: "Expats in Croatia (Facebook)", url: "https://www.facebook.com/groups/expatsincroatia" },
      { name: "r/croatia (Reddit)", url: "https://www.reddit.com/r/croatia" },
      { name: "InterNations Zagreb", url: "https://www.internations.org/zagreb-expats" },
    ],
    language: [
      { name: "italki Croatian tutors", url: "https://www.italki.com/en/teachers/croatian" },
      { name: "Preply Croatian", url: "https://preply.com/en/learn/croatian" },
      { name: "Duolingo Croatian", url: "https://www.duolingo.com/course/hr/en" },
    ],
  },
  "Czech Republic": {
    housing: [
      { name: "Sreality.cz", url: "https://www.sreality.cz" },
      { name: "Bezrealitky", url: "https://www.bezrealitky.cz" },
      { name: "Flatio Czech Republic", url: "https://www.flatio.com/i/apartments-for-rent-czech-republic" },
    ],
    community: [
      { name: "Expats.cz", url: "https://www.expats.cz" },
      { name: "r/prague (Reddit)", url: "https://www.reddit.com/r/prague" },
      { name: "InterNations Prague", url: "https://www.internations.org/prague-expats" },
    ],
    language: [
      { name: "italki Czech tutors", url: "https://www.italki.com/en/teachers/czech" },
      { name: "Czech Language School", url: "https://www.czechlanguageschool.cz" },
      { name: "Duolingo Czech", url: "https://www.duolingo.com/course/cs/en" },
    ],
  },
  "Poland": {
    housing: [
      { name: "Otodom", url: "https://www.otodom.pl" },
      { name: "Gratka Nieruchomości", url: "https://dom.gratka.pl" },
      { name: "Flatio Poland", url: "https://www.flatio.com/i/apartments-for-rent-poland" },
    ],
    community: [
      { name: "Expats in Poland (Facebook)", url: "https://www.facebook.com/groups/expatsinpoland" },
      { name: "r/poland (Reddit)", url: "https://www.reddit.com/r/poland" },
      { name: "InterNations Warsaw", url: "https://www.internations.org/warsaw-expats" },
    ],
    language: [
      { name: "italki Polish tutors", url: "https://www.italki.com/en/teachers/polish" },
      { name: "Preply Polish", url: "https://preply.com/en/learn/polish" },
      { name: "Duolingo Polish", url: "https://www.duolingo.com/course/pl/en" },
    ],
  },
  "Hungary": {
    housing: [
      { name: "Ingatlan.com", url: "https://ingatlan.com" },
      { name: "Flatio Hungary", url: "https://www.flatio.com/i/apartments-for-rent-hungary" },
      { name: "Expat.com Hungary Housing", url: "https://www.expat.com/en/housing/europe/hungary" },
    ],
    community: [
      { name: "Expats in Hungary (Facebook)", url: "https://www.facebook.com/groups/expatsinhungary" },
      { name: "r/budapest (Reddit)", url: "https://www.reddit.com/r/budapest" },
      { name: "InterNations Budapest", url: "https://www.internations.org/budapest-expats" },
    ],
    language: [
      { name: "italki Hungarian tutors", url: "https://www.italki.com/en/teachers/hungarian" },
      { name: "Duolingo Hungarian", url: "https://www.duolingo.com/course/hu/en" },
      { name: "Preply Hungarian", url: "https://preply.com/en/learn/hungarian" },
    ],
  },
  "Serbia": {
    housing: [
      { name: "Halooglasi Nekretnine", url: "https://www.halooglasi.com/nekretnine" },
      { name: "4zida.rs", url: "https://4zida.rs" },
      { name: "Flatio Serbia", url: "https://www.flatio.com/i/apartments-for-rent-serbia" },
    ],
    community: [
      { name: "Expats in Serbia (Facebook)", url: "https://www.facebook.com/groups/expatsinserbiaandbelgrade" },
      { name: "r/serbia (Reddit)", url: "https://www.reddit.com/r/serbia" },
      { name: "InterNations Belgrade", url: "https://www.internations.org/belgrade-expats" },
    ],
    language: [
      { name: "italki Serbian tutors", url: "https://www.italki.com/en/teachers/serbian" },
      { name: "Preply Serbian", url: "https://preply.com/en/learn/serbian" },
      { name: "Duolingo Serbian", url: "https://www.duolingo.com/course/sr/en" },
    ],
  },
  "Montenegro": {
    housing: [
      { name: "Nekretnine.me", url: "https://www.nekretnine.me" },
      { name: "4nekretnine.me", url: "https://4nekretnine.me" },
      { name: "Flatio Montenegro", url: "https://www.flatio.com/i/apartments-for-rent-montenegro" },
    ],
    community: [
      { name: "Expats in Montenegro (Facebook)", url: "https://www.facebook.com/groups/expatsinmontenegro" },
      { name: "r/montenegro (Reddit)", url: "https://www.reddit.com/r/montenegro" },
      { name: "InterNations Montenegro", url: "https://www.internations.org/montenegro-expats" },
    ],
    language: [
      { name: "italki Serbian/Montenegrin tutors", url: "https://www.italki.com/en/teachers/serbian" },
      { name: "Preply Serbian", url: "https://preply.com/en/learn/serbian" },
      { name: "Duolingo Serbian", url: "https://www.duolingo.com/course/sr/en" },
    ],
  },
  "Turkey": {
    housing: [
      { name: "Sahibinden", url: "https://www.sahibinden.com/kiralik-daire" },
      { name: "Hepsiemlak", url: "https://www.hepsiemlak.com" },
      { name: "Flatio Turkey", url: "https://www.flatio.com/i/apartments-for-rent-turkey" },
    ],
    community: [
      { name: "Expats in Turkey (Facebook)", url: "https://www.facebook.com/groups/expatsInturkey" },
      { name: "r/istanbul (Reddit)", url: "https://www.reddit.com/r/istanbul" },
      { name: "InterNations Istanbul", url: "https://www.internations.org/istanbul-expats" },
    ],
    language: [
      { name: "Duolingo Turkish", url: "https://www.duolingo.com/course/tr/en/Learn-Turkish" },
      { name: "italki Turkish tutors", url: "https://www.italki.com/en/teachers/turkish" },
      { name: "Preply Turkish", url: "https://preply.com/en/learn/turkish" },
    ],
  },
  "Albania": {
    housing: [
      { name: "Merrjep Imobiliare", url: "https://www.merrjep.al/imobiliare" },
      { name: "njoftime.com", url: "https://www.njoftime.com" },
      { name: "Expat.com Albania Housing", url: "https://www.expat.com/en/housing/europe/albania" },
    ],
    community: [
      { name: "Expats in Albania (Facebook)", url: "https://www.facebook.com/groups/expatsInAlbania" },
      { name: "r/albania (Reddit)", url: "https://www.reddit.com/r/albania" },
      { name: "InterNations Albania", url: "https://www.internations.org/albania-expats" },
    ],
    language: [
      { name: "italki Albanian tutors", url: "https://www.italki.com/en/teachers/albanian" },
      { name: "Preply Albanian", url: "https://preply.com/en/learn/albanian" },
      { name: "Duolingo Albanian", url: "https://www.duolingo.com/course/sq/en" },
    ],
  },
  "Bulgaria": {
    housing: [
      { name: "imot.bg", url: "https://www.imot.bg" },
      { name: "address.bg", url: "https://www.address.bg" },
      { name: "Flatio Bulgaria", url: "https://www.flatio.com/i/apartments-for-rent-bulgaria" },
    ],
    community: [
      { name: "Expats in Bulgaria (Facebook)", url: "https://www.facebook.com/groups/expatsinbulgaria" },
      { name: "r/bulgaria (Reddit)", url: "https://www.reddit.com/r/bulgaria" },
      { name: "InterNations Sofia", url: "https://www.internations.org/sofia-expats" },
    ],
    language: [
      { name: "italki Bulgarian tutors", url: "https://www.italki.com/en/teachers/bulgarian" },
      { name: "Preply Bulgarian", url: "https://preply.com/en/learn/bulgarian" },
      { name: "Duolingo Bulgarian", url: "https://www.duolingo.com/course/bg/en" },
    ],
  },
  "Romania": {
    housing: [
      { name: "imobiliare.ro", url: "https://www.imobiliare.ro" },
      { name: "storia.ro", url: "https://www.storia.ro" },
      { name: "Flatio Romania", url: "https://www.flatio.com/i/apartments-for-rent-romania" },
    ],
    community: [
      { name: "Expats in Romania (Facebook)", url: "https://www.facebook.com/groups/expatsInRomania" },
      { name: "r/Romania (Reddit)", url: "https://www.reddit.com/r/Romania" },
      { name: "InterNations Bucharest", url: "https://www.internations.org/bucharest-expats" },
    ],
    language: [
      { name: "Duolingo Romanian", url: "https://www.duolingo.com/course/ro/en" },
      { name: "italki Romanian tutors", url: "https://www.italki.com/en/teachers/romanian" },
      { name: "Preply Romanian", url: "https://preply.com/en/learn/romanian" },
    ],
  },
  "Estonia": {
    housing: [
      { name: "KV.ee", url: "https://www.kv.ee" },
      { name: "City24.ee", url: "https://www.city24.ee" },
      { name: "Flatio Estonia", url: "https://www.flatio.com/i/apartments-for-rent-estonia" },
    ],
    community: [
      { name: "Expats in Estonia (Facebook)", url: "https://www.facebook.com/groups/expatsinestonia" },
      { name: "r/Tallinn (Reddit)", url: "https://www.reddit.com/r/Tallinn" },
      { name: "InterNations Tallinn", url: "https://www.internations.org/tallinn-expats" },
    ],
    language: [
      { name: "italki Estonian tutors", url: "https://www.italki.com/en/teachers/estonian" },
      { name: "Keeleklikk Estonian", url: "https://www.keeleklikk.ee/en" },
      { name: "Duolingo Estonian", url: "https://www.duolingo.com/course/et/en" },
    ],
  },
  "Malta": {
    housing: [
      { name: "Frank Salt Real Estate", url: "https://www.franksalt.com.mt" },
      { name: "Quicklets Malta", url: "https://www.quicklets.com.mt" },
      { name: "Flatio Malta", url: "https://www.flatio.com/i/apartments-for-rent-malta" },
    ],
    community: [
      { name: "Expats in Malta (Facebook)", url: "https://www.facebook.com/groups/expatsinmalta" },
      { name: "r/malta (Reddit)", url: "https://www.reddit.com/r/malta" },
      { name: "InterNations Malta", url: "https://www.internations.org/malta-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Maltese", url: "https://www.duolingo.com/course/mt/en" },
      { name: "italki Maltese tutors", url: "https://www.italki.com/en/teachers/maltese" },
    ],
  },
  "Cyprus": {
    housing: [
      { name: "Bazaraki Cyprus", url: "https://www.bazaraki.com/real-estate" },
      { name: "Cyprus Property Web", url: "https://www.cypruspropertyweb.com" },
      { name: "Flatio Cyprus", url: "https://www.flatio.com/i/apartments-for-rent-cyprus" },
    ],
    community: [
      { name: "Expats in Cyprus (Facebook)", url: "https://www.facebook.com/groups/expatsincyprus" },
      { name: "r/cyprus (Reddit)", url: "https://www.reddit.com/r/cyprus" },
      { name: "InterNations Nicosia", url: "https://www.internations.org/nicosia-expats" },
    ],
    language: [
      { name: "English widely spoken — low barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Greek", url: "https://www.duolingo.com/course/el/en" },
      { name: "italki Greek tutors", url: "https://www.italki.com/en/teachers/greek" },
    ],
  },
  // ─── MIDDLE EAST ───
  "UAE": {
    housing: [
      { name: "Bayut", url: "https://www.bayut.com" },
      { name: "Property Finder UAE", url: "https://www.propertyfinder.ae" },
      { name: "Dubizzle", url: "https://dubai.dubizzle.com/property-for-rent" },
    ],
    community: [
      { name: "Expats in Dubai (Facebook)", url: "https://www.facebook.com/groups/expatsindubai" },
      { name: "r/dubai (Reddit)", url: "https://www.reddit.com/r/dubai" },
      { name: "InterNations Dubai", url: "https://www.internations.org/dubai-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Arabic", url: "https://www.duolingo.com/course/ar/en/Learn-Arabic" },
      { name: "italki Arabic tutors", url: "https://www.italki.com/en/teachers/arabic" },
    ],
  },
  "Georgia": {
    housing: [
      { name: "MyHome.ge", url: "https://www.myhome.ge" },
      { name: "SS.ge", url: "https://ss.ge/en/real-estate" },
      { name: "Flatio Georgia", url: "https://www.flatio.com/i/apartments-for-rent-georgia" },
    ],
    community: [
      { name: "Expats in Georgia (Facebook)", url: "https://www.facebook.com/groups/expatsInGeorgiaTbilisi" },
      { name: "r/tbilisi (Reddit)", url: "https://www.reddit.com/r/tbilisi" },
      { name: "InterNations Tbilisi", url: "https://www.internations.org/tbilisi-expats" },
    ],
    language: [
      { name: "italki Georgian tutors", url: "https://www.italki.com/en/teachers/georgian" },
      { name: "Duolingo Georgian", url: "https://www.duolingo.com/course/ka/en" },
      { name: "Preply Georgian", url: "https://preply.com/en/learn/georgian" },
    ],
  },
  "Armenia": {
    housing: [
      { name: "List.am Real Estate", url: "https://www.list.am/en/category/3" },
      { name: "Myrealty.am", url: "https://myrealty.am/en" },
      { name: "Expat.com Armenia Housing", url: "https://www.expat.com/en/housing/asia/armenia" },
    ],
    community: [
      { name: "Expats in Armenia (Facebook)", url: "https://www.facebook.com/groups/expatsinarmenia" },
      { name: "r/armenia (Reddit)", url: "https://www.reddit.com/r/armenia" },
      { name: "InterNations Yerevan", url: "https://www.internations.org/yerevan-expats" },
    ],
    language: [
      { name: "italki Armenian tutors", url: "https://www.italki.com/en/teachers/armenian" },
      { name: "Duolingo Armenian", url: "https://www.duolingo.com/course/hy/en" },
      { name: "Preply Armenian", url: "https://preply.com/en/learn/armenian" },
    ],
  },
  // ─── ASIA ───
  "Thailand": {
    housing: [
      { name: "DDProperty Thailand", url: "https://www.ddproperty.com" },
      { name: "Hipflat", url: "https://www.hipflat.com" },
      { name: "Flatio Thailand", url: "https://www.flatio.com/i/apartments-for-rent-thailand" },
    ],
    community: [
      { name: "Expats in Thailand (Facebook)", url: "https://www.facebook.com/groups/expatsinthailand" },
      { name: "r/ThailandTourism (Reddit)", url: "https://www.reddit.com/r/ThailandTourism" },
      { name: "InterNations Bangkok", url: "https://www.internations.org/bangkok-expats" },
    ],
    language: [
      { name: "Duolingo Thai", url: "https://www.duolingo.com/course/th/en/Learn-Thai" },
      { name: "italki Thai tutors", url: "https://www.italki.com/en/teachers/thai" },
      { name: "Ling App Thai", url: "https://ling-app.com/learn-thai" },
    ],
  },
  "Malaysia": {
    housing: [
      { name: "PropertyGuru Malaysia", url: "https://www.propertyguru.com.my" },
      { name: "iProperty Malaysia", url: "https://www.iproperty.com.my" },
      { name: "Flatio Malaysia", url: "https://www.flatio.com/i/apartments-for-rent-malaysia" },
    ],
    community: [
      { name: "Expats in Malaysia (Facebook)", url: "https://www.facebook.com/groups/expats.in.malaysia" },
      { name: "r/malaysia (Reddit)", url: "https://www.reddit.com/r/malaysia" },
      { name: "InterNations Kuala Lumpur", url: "https://www.internations.org/kuala-lumpur-expats" },
    ],
    language: [
      { name: "English widely spoken — low barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Malay", url: "https://www.duolingo.com/course/ms/en" },
      { name: "italki Malay tutors", url: "https://www.italki.com/en/teachers/malay" },
    ],
  },
  "Indonesia": {
    housing: [
      { name: "Rumah123", url: "https://www.rumah123.com" },
      { name: "Lamudi Indonesia", url: "https://www.lamudi.co.id" },
      { name: "Flatio Bali", url: "https://www.flatio.com/i/apartments-for-rent-indonesia" },
    ],
    community: [
      { name: "Expats in Bali (Facebook)", url: "https://www.facebook.com/groups/expatsinbali" },
      { name: "r/bali (Reddit)", url: "https://www.reddit.com/r/bali" },
      { name: "InterNations Bali", url: "https://www.internations.org/bali-expats" },
    ],
    language: [
      { name: "Duolingo Indonesian", url: "https://www.duolingo.com/course/id/en/Learn-Indonesian" },
      { name: "italki Indonesian tutors", url: "https://www.italki.com/en/teachers/indonesian" },
      { name: "Ling App Indonesian", url: "https://ling-app.com/learn-indonesian" },
    ],
  },
  "Vietnam": {
    housing: [
      { name: "Batdongsan.com.vn", url: "https://batdongsan.com.vn" },
      { name: "Expat.com Vietnam Housing", url: "https://www.expat.com/en/housing/asia/vietnam" },
      { name: "Flatio Vietnam", url: "https://www.flatio.com/i/apartments-for-rent-vietnam" },
    ],
    community: [
      { name: "Expats in Vietnam (Facebook)", url: "https://www.facebook.com/groups/expatsinvietnam" },
      { name: "r/VietNam (Reddit)", url: "https://www.reddit.com/r/VietNam" },
      { name: "InterNations Ho Chi Minh", url: "https://www.internations.org/ho-chi-minh-city-expats" },
    ],
    language: [
      { name: "Duolingo Vietnamese", url: "https://www.duolingo.com/course/vi/en/Learn-Vietnamese" },
      { name: "italki Vietnamese tutors", url: "https://www.italki.com/en/teachers/vietnamese" },
      { name: "Ling App Vietnamese", url: "https://ling-app.com/learn-vietnamese" },
    ],
  },
  "Japan": {
    housing: [
      { name: "SUUMO", url: "https://suumo.jp" },
      { name: "GaijinPot Housing", url: "https://housing.gaijinpot.com" },
      { name: "Sakura House (foreigner-friendly)", url: "https://www.sakura-house.com" },
    ],
    community: [
      { name: "Expats in Japan (Facebook)", url: "https://www.facebook.com/groups/expatsinjapan" },
      { name: "r/japanlife (Reddit)", url: "https://www.reddit.com/r/japanlife" },
      { name: "InterNations Tokyo", url: "https://www.internations.org/tokyo-expats" },
    ],
    language: [
      { name: "Duolingo Japanese", url: "https://www.duolingo.com/course/ja/en/Learn-Japanese" },
      { name: "italki Japanese tutors", url: "https://www.italki.com/en/teachers/japanese" },
      { name: "JapanesePod101", url: "https://www.japanesepod101.com" },
    ],
  },
  "Singapore": {
    housing: [
      { name: "PropertyGuru Singapore", url: "https://www.propertyguru.com.sg" },
      { name: "99.co", url: "https://www.99.co" },
      { name: "Flatio Singapore", url: "https://www.flatio.com/i/apartments-for-rent-singapore" },
    ],
    community: [
      { name: "Expats in Singapore (Facebook)", url: "https://www.facebook.com/groups/expats.in.singapore" },
      { name: "r/singapore (Reddit)", url: "https://www.reddit.com/r/singapore" },
      { name: "InterNations Singapore", url: "https://www.internations.org/singapore-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Mandarin", url: "https://www.duolingo.com/course/zh/en/Learn-Chinese" },
      { name: "italki Mandarin tutors", url: "https://www.italki.com/en/teachers/chinese-mandarin" },
    ],
  },
  "South Korea": {
    housing: [
      { name: "Zigbang", url: "https://www.zigbang.com" },
      { name: "Naver Real Estate", url: "https://land.naver.com" },
      { name: "Flatio South Korea", url: "https://www.flatio.com/i/apartments-for-rent-south-korea" },
    ],
    community: [
      { name: "Expats in Korea (Facebook)", url: "https://www.facebook.com/groups/expatskorea" },
      { name: "r/korea (Reddit)", url: "https://www.reddit.com/r/korea" },
      { name: "InterNations Seoul", url: "https://www.internations.org/seoul-expats" },
    ],
    language: [
      { name: "Duolingo Korean", url: "https://www.duolingo.com/course/ko/en/Learn-Korean" },
      { name: "italki Korean tutors", url: "https://www.italki.com/en/teachers/korean" },
      { name: "Talk To Me In Korean", url: "https://talktomeinkorean.com" },
    ],
  },
  // ─── AMERICAS ───
  "Mexico": {
    housing: [
      { name: "Inmuebles24", url: "https://www.inmuebles24.com" },
      { name: "Lamudi Mexico", url: "https://www.lamudi.com.mx" },
      { name: "Flatio Mexico", url: "https://www.flatio.com/i/apartments-for-rent-mexico" },
    ],
    community: [
      { name: "Expats in Mexico (Facebook)", url: "https://www.facebook.com/groups/expats.in.mexico" },
      { name: "r/mexico (Reddit)", url: "https://www.reddit.com/r/mexico" },
      { name: "InterNations Mexico City", url: "https://www.internations.org/mexico-city-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  "Colombia": {
    housing: [
      { name: "Fincaraiz", url: "https://www.fincaraiz.com.co" },
      { name: "Metrocuadrado", url: "https://www.metrocuadrado.com" },
      { name: "Flatio Colombia", url: "https://www.flatio.com/i/apartments-for-rent-colombia" },
    ],
    community: [
      { name: "Expats in Colombia (Facebook)", url: "https://www.facebook.com/groups/expatsincolombia" },
      { name: "r/medellin (Reddit)", url: "https://www.reddit.com/r/medellin" },
      { name: "InterNations Medellín", url: "https://www.internations.org/medellin-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  "Panama": {
    housing: [
      { name: "Encuentra24 Panama", url: "https://www.encuentra24.com/panama-en/real-estate" },
      { name: "Compreoalquile.com", url: "https://www.compreoalquile.com" },
      { name: "Expat.com Panama Housing", url: "https://www.expat.com/en/housing/americas/panama" },
    ],
    community: [
      { name: "Expats in Panama (Facebook)", url: "https://www.facebook.com/groups/expats.in.panama" },
      { name: "r/Panama (Reddit)", url: "https://www.reddit.com/r/Panama" },
      { name: "InterNations Panama City", url: "https://www.internations.org/panama-city-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  "Argentina": {
    housing: [
      { name: "Zonaprop", url: "https://www.zonaprop.com.ar" },
      { name: "Argenprop", url: "https://www.argenprop.com" },
      { name: "Flatio Argentina", url: "https://www.flatio.com/i/apartments-for-rent-argentina" },
    ],
    community: [
      { name: "Expats in Argentina (Facebook)", url: "https://www.facebook.com/groups/expatsinargentina" },
      { name: "r/argentina (Reddit)", url: "https://www.reddit.com/r/argentina" },
      { name: "InterNations Buenos Aires", url: "https://www.internations.org/buenos-aires-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  "Brazil": {
    housing: [
      { name: "Viva Real", url: "https://www.vivareal.com.br" },
      { name: "Zap Imóveis", url: "https://www.zapimoveis.com.br" },
      { name: "Flatio Brazil", url: "https://www.flatio.com/i/apartments-for-rent-brazil" },
    ],
    community: [
      { name: "Expats in Brazil (Facebook)", url: "https://www.facebook.com/groups/expats.in.brazil" },
      { name: "r/brazil (Reddit)", url: "https://www.reddit.com/r/brazil" },
      { name: "InterNations São Paulo", url: "https://www.internations.org/sao-paulo-expats" },
    ],
    language: [
      { name: "Duolingo Portuguese", url: "https://www.duolingo.com/course/pt/en/Learn-Portuguese" },
      { name: "italki Portuguese tutors", url: "https://www.italki.com/en/teachers/portuguese" },
      { name: "Preply Portuguese", url: "https://preply.com/en/learn/portuguese" },
    ],
  },
  "Canada": {
    housing: [
      { name: "Realtor.ca", url: "https://www.realtor.ca" },
      { name: "Kijiji Rentals Canada", url: "https://www.kijiji.ca/b-apartments-condos/canada/c37l0" },
      { name: "PadMapper Canada", url: "https://www.padmapper.com" },
    ],
    community: [
      { name: "Expats in Canada (Facebook)", url: "https://www.facebook.com/groups/expats.in.canada" },
      { name: "r/ImmigrationCanada (Reddit)", url: "https://www.reddit.com/r/ImmigrationCanada" },
      { name: "InterNations Toronto", url: "https://www.internations.org/toronto-expats" },
    ],
    language: [
      { name: "English/French — no major barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo French (for Quebec)", url: "https://www.duolingo.com/course/fr/en/Learn-French" },
      { name: "italki French tutors", url: "https://www.italki.com/en/teachers/french" },
    ],
  },
  "Uruguay": {
    housing: [
      { name: "Gallito.com.uy", url: "https://www.gallito.com.uy/inmuebles" },
      { name: "MercadoLibre Uruguay", url: "https://inmuebles.mercadolibre.com.uy" },
      { name: "Expat.com Uruguay Housing", url: "https://www.expat.com/en/housing/americas/uruguay" },
    ],
    community: [
      { name: "Expats in Uruguay (Facebook)", url: "https://www.facebook.com/groups/expats.in.uruguay" },
      { name: "r/uruguay (Reddit)", url: "https://www.reddit.com/r/uruguay" },
      { name: "InterNations Montevideo", url: "https://www.internations.org/montevideo-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  "Costa Rica": {
    housing: [
      { name: "Encuentra24 Costa Rica", url: "https://www.encuentra24.com/costa-rica-en/real-estate" },
      { name: "CRhomes", url: "https://www.crhomes.com" },
      { name: "Expat.com Costa Rica Housing", url: "https://www.expat.com/en/housing/americas/costa-rica" },
    ],
    community: [
      { name: "Expats in Costa Rica (Facebook)", url: "https://www.facebook.com/groups/expatsincostarica" },
      { name: "r/CostaRica (Reddit)", url: "https://www.reddit.com/r/CostaRica" },
      { name: "InterNations San José", url: "https://www.internations.org/san-jose-expats" },
    ],
    language: [
      { name: "Duolingo Spanish", url: "https://www.duolingo.com/course/es/en/Learn-Spanish" },
      { name: "italki Spanish tutors", url: "https://www.italki.com/en/teachers/spanish" },
      { name: "Preply Spanish", url: "https://preply.com/en/learn/spanish" },
    ],
  },
  // ─── AFRICA & ISLANDS ───
  "South Africa": {
    housing: [
      { name: "Private Property SA", url: "https://www.privateproperty.co.za" },
      { name: "Property24", url: "https://www.property24.com" },
      { name: "Expat.com SA Housing", url: "https://www.expat.com/en/housing/africa/south-africa" },
    ],
    community: [
      { name: "Expats in South Africa (Facebook)", url: "https://www.facebook.com/groups/expatsinsouthafrica" },
      { name: "r/southafrica (Reddit)", url: "https://www.reddit.com/r/southafrica" },
      { name: "InterNations Cape Town", url: "https://www.internations.org/cape-town-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo Afrikaans", url: "https://www.duolingo.com/course/af/en" },
      { name: "italki tutors", url: "https://www.italki.com" },
    ],
  },
  "Morocco": {
    housing: [
      { name: "Mubawab Morocco", url: "https://www.mubawab.ma" },
      { name: "Avito Immobilier", url: "https://www.avito.ma/fr/immobilier" },
      { name: "Expat.com Morocco Housing", url: "https://www.expat.com/en/housing/africa/morocco" },
    ],
    community: [
      { name: "Expats in Morocco (Facebook)", url: "https://www.facebook.com/groups/expatsinmorocco" },
      { name: "r/morocco (Reddit)", url: "https://www.reddit.com/r/morocco" },
      { name: "InterNations Casablanca", url: "https://www.internations.org/casablanca-expats" },
    ],
    language: [
      { name: "Duolingo Arabic", url: "https://www.duolingo.com/course/ar/en/Learn-Arabic" },
      { name: "Duolingo French", url: "https://www.duolingo.com/course/fr/en/Learn-French" },
      { name: "italki Arabic tutors", url: "https://www.italki.com/en/teachers/arabic" },
    ],
  },
  "Mauritius": {
    housing: [
      { name: "Lexpress Property", url: "https://www.lexpressproperty.com" },
      { name: "Rightmove Mauritius", url: "https://www.rightmove.co.uk/overseas-property/in-Mauritius.html" },
      { name: "Expat.com Mauritius Housing", url: "https://www.expat.com/en/housing/africa/mauritius" },
    ],
    community: [
      { name: "Expats in Mauritius (Facebook)", url: "https://www.facebook.com/groups/expatsInMauritius" },
      { name: "r/mauritius (Reddit)", url: "https://www.reddit.com/r/mauritius" },
      { name: "InterNations Mauritius", url: "https://www.internations.org/mauritius-expats" },
    ],
    language: [
      { name: "English/French official — low barrier", url: "https://www.duolingo.com" },
      { name: "Duolingo French", url: "https://www.duolingo.com/course/fr/en/Learn-French" },
      { name: "italki French tutors", url: "https://www.italki.com/en/teachers/french" },
    ],
  },
  // ─── PACIFIC ───
  "Australia": {
    housing: [
      { name: "Domain.com.au", url: "https://www.domain.com.au" },
      { name: "Realestate.com.au", url: "https://www.realestate.com.au" },
      { name: "Flatmates.com.au", url: "https://flatmates.com.au" },
    ],
    community: [
      { name: "Expats in Australia (Facebook)", url: "https://www.facebook.com/groups/expats.in.australia" },
      { name: "r/australia (Reddit)", url: "https://www.reddit.com/r/australia" },
      { name: "InterNations Sydney", url: "https://www.internations.org/sydney-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "IELTS preparation", url: "https://www.ielts.org" },
      { name: "italki tutors", url: "https://www.italki.com" },
    ],
  },
  "New Zealand": {
    housing: [
      { name: "Trade Me Property", url: "https://www.trademe.co.nz/property" },
      { name: "Homes.co.nz", url: "https://homes.co.nz" },
      { name: "Expat.com NZ Housing", url: "https://www.expat.com/en/housing/oceania/new-zealand" },
    ],
    community: [
      { name: "Expats in New Zealand (Facebook)", url: "https://www.facebook.com/groups/expatsinnewzealand" },
      { name: "r/newzealand (Reddit)", url: "https://www.reddit.com/r/newzealand" },
      { name: "InterNations Auckland", url: "https://www.internations.org/auckland-expats" },
    ],
    language: [
      { name: "English is official — no barrier", url: "https://www.duolingo.com" },
      { name: "IELTS preparation", url: "https://www.ielts.org" },
      { name: "italki tutors", url: "https://www.italki.com" },
    ],
  },
};

export default function DashboardCountries({
  profile,
  onNavigate,
}: {
  profile: UserProfile | null;
  onNavigate?: (tab: DashboardTab) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);

  const regions = [
    { id: "all", label: "All" },
    { id: "europe", label: "Europe" },
    { id: "asia", label: "Asia" },
    { id: "americas", label: "Americas" },
    { id: "middle_east", label: "Middle East" },
  ];

  const filtered = countryDatabase.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === "all" || c.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  if (selectedCountry) {
    return (
      <CountryDetail
        country={selectedCountry}
        profile={profile}
        onBack={() => setSelectedCountry(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Countries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore relocation destinations and compare options
        </p>
      </div>

      {profile?.target_country &&
        (() => {
          const current = countryDatabase.find((c) => c.name === profile.target_country);
          if (!current) return null;
          return (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCountry(current);
                }
              }}
              className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 cursor-pointer hover:bg-primary/[0.07] transition-colors"
              onClick={() => setSelectedCountry(current)}
            >
              <p className="text-[11px] uppercase tracking-widest text-primary/70 font-medium mb-2">
                Your destination
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current.flag}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[15px]">{current.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {current.topVisa} · {current.stabilityMonths} months to stability
                  </p>
                </div>
                <ArrowRight size={16} className="text-primary shrink-0" />
              </div>
            </div>
          );
        })()}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRegion(r.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              selectedRegion === r.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.08]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((country, i) => {
          const isUserCountry = country.name === profile?.target_country;

          return (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              onClick={() => setSelectedCountry(country)}
              className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/[0.05] ${
                isUserCountry
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[14px]">{country.name}</p>
                    {isUserCountry && (
                      <span className="text-[9px] uppercase tracking-wider text-primary font-medium">
                        Your pick
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{country.topVisa}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={10} /> {country.stabilityMonths} mo
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {country.climate === "warm" ? "🌞 Warm" : country.climate === "cold" ? "❄️ Cold" : "🌤 Moderate"}
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {country.costLevel === "low" ? "💚 Low cost" : country.costLevel === "high" ? "🔴 High cost" : "🟡 Medium cost"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {`No countries found for "${search}"`}
        </div>
      )}
    </div>
  );
}

function CountryDetail({
  country,
  profile: _profile,
  onBack,
  onNavigate,
}: {
  country: CountryProfile;
  profile: UserProfile | null;
  onBack: () => void;
  onNavigate?: (tab: DashboardTab) => void;
}) {
  const citizenshipLabel =
    country.citizenshipYears != null ? `${country.citizenshipYears} years` : "No path";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to countries
      </button>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-7">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{country.flag}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{country.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{country.topVisa}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stability</p>
            <p className="font-bold">{country.stabilityMonths} mo</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Language</p>
            <p className={`font-bold ${
              country.languageBarrier === "low" ? "text-green-400" :
              country.languageBarrier === "high" ? "text-red-400" : "text-amber-400"
            }`}>
              {country.languageBarrier === "low" ? "Easy" : country.languageBarrier === "high" ? "Hard" : "Moderate"}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Cost level</p>
            <p className="font-bold capitalize">{country.costLevel}</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Citizenship</p>
            <p className="font-bold">{citizenshipLabel}</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Climate</p>
            <p className="font-bold capitalize">{country.climate}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
          Best for
        </p>
        <div className="flex flex-wrap gap-2">
          {country.bestFor.map((goal) => (
            <span
              key={goal}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium capitalize"
            >
              {goal.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
          ⚠ Risks & considerations
        </p>
        <div className="space-y-2">
          {country.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
              <p className="text-[13px] text-muted-foreground">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {(() => {
        const resources = COUNTRY_RESOURCES[country.name];
        if (!resources) return null;
        return (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">🏙 Living there</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Housing */}
              <div>
                <p className="text-[11px] font-semibold text-primary/80 mb-2 flex items-center gap-1.5">
                  🏠 Find housing
                </p>
                <div className="space-y-1.5">
                  {resources.housing.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-[12px] text-muted-foreground hover:text-primary transition-colors truncate">
                      → {r.name}
                    </a>
                  ))}
                </div>
              </div>
              {/* Community */}
              <div>
                <p className="text-[11px] font-semibold text-amber-400/80 mb-2 flex items-center gap-1.5">
                  👥 Expat community
                </p>
                <div className="space-y-1.5">
                  {resources.community.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-[12px] text-muted-foreground hover:text-amber-400 transition-colors truncate">
                      → {r.name}
                    </a>
                  ))}
                </div>
              </div>
              {/* Language */}
              <div>
                <p className="text-[11px] font-semibold text-green-400/80 mb-2 flex items-center gap-1.5">
                  🗣 Learn the language
                </p>
                <div className="space-y-1.5">
                  {resources.language.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-[12px] text-muted-foreground hover:text-green-400 transition-colors truncate">
                      → {r.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-[14px]">Want to move to {country.name}?</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Ask your advisor for a personalized plan
          </p>
        </div>
        <Button onClick={() => onNavigate?.("chat")} className="shrink-0">
          Ask Advisor <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

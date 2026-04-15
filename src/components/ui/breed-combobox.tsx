'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ChevronDown, X } from 'lucide-react'

// FCI + AKC recognized breeds + common French breeds
const DOG_BREEDS = [
  'Affenpinscher',
  'Afghan Hound',
  'Airedale Terrier',
  'Akita',
  'Akita Américain',
  'Alaskan Malamute',
  'American Bully',
  'American Staffordshire Terrier',
  'Appenzeller Sennenhund',
  'Azawakh',
  'Barbet',
  'Basenji',
  'Basset Artésien Normand',
  'Basset Bleu de Gascogne',
  'Basset Fauve de Bretagne',
  'Basset Griffon Vendéen (Grand)',
  'Basset Griffon Vendéen (Petit)',
  'Basset Hound',
  'Beagle',
  'Beagle-Harrier',
  'Beauceron',
  'Bedlington Terrier',
  'Berger Allemand',
  'Berger Australien',
  'Berger Belge Groenendael',
  'Berger Belge Laekenois',
  'Berger Belge Malinois',
  'Berger Belge Tervueren',
  'Berger Blanc Suisse',
  'Berger de Brie (Briard)',
  'Berger de Picardie',
  'Berger des Pyrénées',
  'Berger des Shetland',
  'Berger du Caucase',
  'Berger Hollandais',
  'Berger Islandais',
  'Bichon Frisé',
  'Bichon Havanais',
  'Billy',
  'Bloodhound',
  'Bobtail (Old English Sheepdog)',
  'Boerboel',
  'Border Collie',
  'Border Terrier',
  'Borzoi',
  'Boston Terrier',
  'Bouledogue Américain',
  'Bouledogue Anglais',
  'Bouledogue Français',
  'Bouvier Australien',
  'Bouvier Bernois',
  'Bouvier de Flandres',
  'Boxer',
  'Braque Allemand à Poil Court',
  'Braque Allemand à Poil Dur',
  "Braque d'Auvergne",
  "Braque de l'Ariège",
  'Braque de Weimar',
  'Braque du Bourbonnais',
  'Braque Français',
  'Braque Hongrois (Vizsla)',
  'Braque Hongrois à Poil Dur',
  'Braque Saint-Germain',
  'Briquet Griffon Vendéen',
  'Bullmastiff',
  'Bullterrier',
  'Bullterrier Miniature',
  'Cairn Terrier',
  'Cane Corso',
  'Caniche (Toy)',
  'Caniche Miniature',
  'Caniche Moyen',
  'Caniche Royal',
  'Carlino (Carlin)',
  'Carlin',
  'Cavalier King Charles Spaniel',
  'Cesky Terrier',
  'Chien Courant de Transylvanie',
  'Chien Courant Suisse',
  "Chien d'Artois",
  "Chien d'Ours de Carélie",
  'Chien de Berger de Majorque',
  'Chien de Castro Laboreiro',
  "Chien de l'Atlas",
  'Chien de Montagne des Pyrénées',
  'Chien de Rhodésie à Crête Dorsale',
  'Chien de Saint-Hubert',
  'Chien du Pharaon',
  'Chien Finnois de Laponie',
  'Chien Finnois de Spitz',
  'Chien Norvégien de Macareux',
  'Chien Norvégien de Montagne',
  'Chihuahua',
  'Chinese Crested',
  'Chow-Chow',
  'Clumber Spaniel',
  'Cockapoo',
  'Cocker Américain',
  'Cocker Anglais',
  'Colley à Poil Long',
  'Colley à Poil Ras',
  'Corgi Cardigan',
  'Corgi Pembroke',
  'Coton de Tuléar',
  'Dachshund (Teckel)',
  'Dalmatien',
  'Dandie Dinmont Terrier',
  'Dobermann',
  'Dogue Allemand',
  'Dogue Argentin',
  'Dogue de Bordeaux',
  'Dogue du Tibet',
  'Drathaar',
  'Épagneul Bleu de Picardie',
  'Épagneul Breton',
  'Épagneul de Pont-Audemer',
  'Épagneul Français',
  'Épagneul Japonais',
  'Épagneul Nain Continental',
  'Épagneul Picard',
  'Eurasier',
  'Field Spaniel',
  'Fila Brasileiro',
  'Fox Terrier à Poil Dur',
  'Fox Terrier à Poil Lisse',
  'Foxhound Américain',
  'Foxhound Anglais',
  'Golden Retriever',
  'Gordon Setter',
  'Grand Anglo-Français Blanc et Noir',
  'Grand Anglo-Français Tricolore',
  'Grand Basset Griffon Vendéen',
  'Grand Bleu de Gascogne',
  'Grand Bouvier Suisse',
  'Grand Danois',
  'Grand Épagneul de Munster',
  'Grand Griffon Vendéen',
  'Greyhound',
  'Griffon Belge',
  'Griffon Bleu de Gascogne',
  'Griffon Bruxellois',
  "Griffon d'Arrêt à Poil Dur",
  'Griffon Fauve de Bretagne',
  'Griffon Nivernais',
  'Hovawart',
  'Husky Sibérien',
  'Inca Orchidée',
  'Irish Terrier',
  'Irish Water Spaniel',
  'Irish Wolfhound',
  'Jack Russell Terrier',
  'Jagdterrier',
  'Kai Ken',
  'Kerry Blue Terrier',
  'Kishu',
  'Komondor',
  'Kooikerhondje',
  'Kuvasz',
  'Labradoodle',
  'Labrador Retriever',
  'Lagotto Romagnolo',
  'Lakeland Terrier',
  'Leonberg',
  'Lévrier Afghan',
  'Lévrier Espagnol (Galgo)',
  'Lévrier Hongrois (Magyar Agar)',
  'Lévrier Italien',
  'Lévrier Persan (Saluki)',
  'Lévrier Polonais',
  'Lhassa Apso',
  'Löwchen',
  "Malamute d'Alaska",
  'Mâtin de Naples',
  'Mâtin des Pyrénées',
  'Mâtin Espagnol',
  'Mâtin Tibétain',
  'Maltais',
  'Manchester Terrier',
  'Mastiff',
  'Mudi',
  'Münsterländer (Grand)',
  'Münsterländer (Petit)',
  'Norfolk Terrier',
  'Norrbottenspets',
  'Norwich Terrier',
  'Nouveau-Brunswick Duck Tolling Retriever',
  'Petit Brabançon',
  'Petit Chien Lion (Löwchen)',
  'Pinscher (Moyen)',
  'Pinscher Nain',
  'Pit Bull',
  'Plott Hound',
  'Podenco Ibicenco',
  'Podengo Portugais',
  'Pointer',
  'Poméranie (Spitz Nain)',
  'Porcelaine',
  'Puli',
  'Pumi',
  'Retriever à Poil Bouclé',
  'Retriever à Poil Plat',
  'Retriever de la Baie de Chesapeake',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Saint-Bernard',
  'Samoyède',
  'Schipperke',
  'Schnauzer Géant',
  'Schnauzer Miniature',
  'Schnauzer Moyen',
  'Scottish Deerhound',
  'Scottish Terrier',
  'Sealyham Terrier',
  'Setter Anglais',
  'Setter Gordon',
  'Setter Irlandais',
  'Setter Irlandais Rouge et Blanc',
  'Shiba Inu',
  'Shih Tzu',
  'Silky Terrier',
  'Skye Terrier',
  'Sloughi',
  'Soft Coated Wheaten Terrier',
  'Spitz Allemand',
  'Spitz Finlandais',
  'Spitz Japonais',
  'Spitz Loup',
  'Springer Anglais',
  'Springer Gallois',
  'Staffordshire Bull Terrier',
  'Sussex Spaniel',
  'Teckel (Poil Dur)',
  'Teckel (Poil Lisse)',
  'Teckel (Poil Long)',
  'Tenterfield Terrier',
  'Terrier Australien',
  'Terrier Brésilien',
  'Terrier Chilien',
  'Terrier de Boston',
  "Terrier de l'Île de Skye",
  'Terrier Noir Russe',
  'Terrier Tibétain',
  'Tosa',
  'Toy Terrier Anglais',
  'Weimaraner',
  'Welsh Corgi Cardigan',
  'Welsh Corgi Pembroke',
  'Welsh Terrier',
  'West Highland White Terrier',
  'Whippet',
  'Xoloitzcuintle',
  'Yorkshire Terrier',
  'Berger Maremme et des Abruzzes',
  'Berger Polonais de Plaine',
  'Berger Polonais de Podhale',
  'Berger de Croatie',
  'Berger Catalan',
  'Berger Roumain des Carpathes',
  'Berger Roumain de Mioritza',
  'Berger Tchèque',
  "Berger d'Anatolie",
  'Bouvier Appenzellois',
  'Bouvier Entlebuchois',
  "Bouvier de l'Entlebuch",
  "Chien de Montagne de l'Atlas",
  'Chien Courant Bosniaque',
  'Chien Courant Grec',
  'Chien Courant Helvétique',
  'Chien Courant Slovaque',
  'Chien de Berger Bergamasque',
  'Chien de Montagne du Portugal',
  "Cirneco dell'Etna",
  'Cão de Castro Laboreiro',
  'Cão da Serra de Aires',
  'Dogue du Canari (Presa Canario)',
  'Épagneul de la Vallée de la Clyde',
  'Grand Bouvier Suisse',
  'Lundehund',
  'Perro de Presa Canario',
  'Spitz Moyen',
  'Spitz Grand',
  'Spitz Petit',
  'Terrier Chasse au Renard',
  'Mélange / Mix',
].sort()

interface BreedComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function BreedCombobox({ value, onChange }: BreedComboboxProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered =
    query.trim().length === 0
      ? DOG_BREEDS
      : DOG_BREEDS.filter((b) => b.toLowerCase().includes(query.toLowerCase()))

  // Sync external value → local query when form resets
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(breed: string) {
    setQuery(breed)
    onChange(breed)
    setOpen(false)
  }

  function clear() {
    setQuery('')
    onChange('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          placeholder="Ex: Labrador, Caniche..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="pr-8"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={query ? clear : () => setOpen((o) => !o)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          {query ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-[9999] mt-1 w-full rounded-xl border border-charcoal/10 bg-white shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((breed) => (
            <li key={breed}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(breed)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-rose/30 transition-colors"
              >
                {breed}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

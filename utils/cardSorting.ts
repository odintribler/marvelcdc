interface DeckCard {
  id: number
  deckId: number
  cardCode: string
  cardName: string
  quantity: number
  cardType: string
  packCode: string
  faction: string | null
}

export interface CardTypeGroup {
  title: string
  cards: DeckCard[]
  cardType: string | null
}

export interface SortedCardGroup {
  title: string
  cards: DeckCard[]
  faction: string | null
  cardTypeGroups: CardTypeGroup[]
}

export function sortCardsByFaction(cards: DeckCard[], heroCode: string): SortedCardGroup[] {
  // Define the sorting order for factions
  const factionOrder = {
    hero: 0,
    aggression: 1,
    justice: 2,
    leadership: 3,
    protection: 4,
    basic: 5
  }

  // Group cards by faction
  const groupedCards: { [key: string]: DeckCard[] } = {}
  
  cards.forEach(card => {
    let factionKey: string
    
    // Hero cards are identified by pack code matching hero code or faction being null
    if (card.faction === null || card.packCode === heroCode) {
      factionKey = 'hero'
    } else if (card.faction === 'basic') {
      factionKey = 'basic'
    } else {
      factionKey = card.faction
    }
    
    if (!groupedCards[factionKey]) {
      groupedCards[factionKey] = []
    }
    groupedCards[factionKey].push(card)
  })

  // Create sorted groups array with card type sub-grouping
  const sortedGroups: SortedCardGroup[] = []
  
  // Add groups in the specified order
  const orderedFactions = ['hero', 'aggression', 'justice', 'leadership', 'protection', 'basic']
  
  orderedFactions.forEach(faction => {
    if (groupedCards[faction] && groupedCards[faction].length > 0) {
      // Group cards by type within this faction
      const cardsByType: { [key: string]: DeckCard[] } = {}
      
      groupedCards[faction].forEach(card => {
        const cardType = card.cardType || 'unknown'
        if (!cardsByType[cardType]) {
          cardsByType[cardType] = []
        }
        cardsByType[cardType].push(card)
      })
      
      // Sort cards within each type by name
      Object.keys(cardsByType).forEach(cardType => {
        cardsByType[cardType].sort((a, b) => a.cardName.localeCompare(b.cardName))
      })
      
      // Define card type order
      const cardTypeOrder = ['hero', 'ally', 'support', 'upgrade', 'event', 'resource', 'unknown']
      
      // Create card type groups
      const cardTypeGroups: CardTypeGroup[] = []
      cardTypeOrder.forEach(cardType => {
        if (cardsByType[cardType] && cardsByType[cardType].length > 0) {
          cardTypeGroups.push({
            title: getCardTypeDisplayName(cardType),
            cards: cardsByType[cardType],
            cardType: cardType === 'unknown' ? null : cardType
          })
        }
      })
      
      sortedGroups.push({
        title: getFactionDisplayName(faction),
        cards: groupedCards[faction], // Keep all cards for backwards compatibility
        faction: faction === 'hero' ? null : faction,
        cardTypeGroups
      })
    }
  })

  return sortedGroups
}

function getFactionDisplayName(faction: string): string {
  const displayNames: { [key: string]: string } = {
    hero: 'Hero Cards',
    aggression: 'Aggression',
    justice: 'Justice', 
    leadership: 'Leadership',
    protection: 'Protection',
    basic: 'Basic'
  }
  
  return displayNames[faction] || faction
}

function getCardTypeDisplayName(cardType: string): string {
  const displayNames: { [key: string]: string } = {
    hero: 'Hero',
    ally: 'Allies',
    support: 'Supports',
    upgrade: 'Upgrades',
    event: 'Events',
    resource: 'Resources',
    unknown: 'Other'
  }
  
  return displayNames[cardType] || cardType
}

// Helper function to get faction color classes for UI
export function getFactionColorClasses(faction: string | null): string {
  const colorClasses: { [key: string]: string } = {
    aggression: 'text-red-600 bg-red-50 border-red-200',
    justice: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    leadership: 'text-blue-600 bg-blue-50 border-blue-200',
    protection: 'text-green-600 bg-green-50 border-green-200',
    basic: 'text-gray-600 bg-gray-50 border-gray-200',
    hero: 'text-purple-600 bg-purple-50 border-purple-200'
  }
  
  if (!faction) return colorClasses.hero
  return colorClasses[faction] || colorClasses.basic
}
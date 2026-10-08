export const CATEGORIES = ['OIL', 'FILTER', 'BRAKES', 'SUSPENSION', 'ENGINE', 'ELECTRICAL', 'AC', 'ACCESSORIES']

export const CATEGORY_ICONS = {
  OIL: 'oil_barrel', FILTER: 'filter_alt', BRAKES: 'tire_repair', SUSPENSION: 'car_repair',
  ENGINE: 'settings', ELECTRICAL: 'bolt', AC: 'ac_unit', ACCESSORIES: 'construction',
}

export const MOVEMENT_TYPES = [
  { key: 'receipts', label: 'Delivery from supplier', icon: 'local_shipping', sign: 1 },
  { key: 'returns', label: 'Return to store', icon: 'assignment_return', sign: 1 },
  { key: 'adjustments', label: 'Adjustment (stock count)', icon: 'tune', sign: 0 },
]

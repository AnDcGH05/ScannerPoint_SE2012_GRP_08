/**
 * Every feature folder (customer, repair, inventory, billing) has a routes.jsx that
 * describes its pages and menu items. Vite finds them automatically, so adding a
 * feature never means editing App.jsx or the layouts.
 */
const modules = import.meta.glob('./*/routes.jsx', { eager: true })
const features = Object.values(modules).map((m) => m.default)

const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99)

export const customerRoutes = features.flatMap((f) => f.customerRoutes || [])
export const staffRoutes = features.flatMap((f) => f.staffRoutes || [])
export const customerNav = features.flatMap((f) => f.customerNav || []).sort(byOrder)
export const staffNav = features.flatMap((f) => f.staffNav || []).sort(byOrder)

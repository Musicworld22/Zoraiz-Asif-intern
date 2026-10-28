
import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProducts() {
    try {
      setLoading(true)
      const res = await fetch('https://dummyjson.com/products?limit=30')
      if (!res.ok) throw new Error('Unable to load products')
      const data = await res.json()
      setProducts(data.products)
      setError('')
    } catch {
      setError('Could not load products. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function saveProduct(e) {
    e.preventDefault()

    try {
      const editing = editId !== null
      const res = await fetch(
        editing
          ? `https://dummyjson.com/products/${editId}`
          : 'https://dummyjson.com/products/add',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), price: Number(price) })
        }
      )

      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()

      if (editing) {
        setProducts(old => old.map(p => p.id === editId ? { ...p, ...data } : p))
      } else {
        setProducts(old => [{ ...data, id: data.id || Date.now() }, ...old])
      }

      setTitle('')
      setPrice('')
      setEditId(null)
      setError('')
    } catch {
      setError('The request failed. Please try again.')
    }
  }

  async function deleteProduct(id) {
    try {
      const res = await fetch(`https://dummyjson.com/products/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Delete failed')
      setProducts(old => old.filter(p => p.id !== id))
    } catch {
      setError('Unable to delete this product.')
    }
  }

  function editProduct(product) {
    setEditId(product.id)
    setTitle(product.title)
    setPrice(String(product.price))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = products.reduce((sum, p) => sum + Number(p.price || 0), 0)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:flex">
      <aside className="flex w-full flex-col bg-slate-950 p-6 text-white md:min-h-screen md:w-64">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-xl font-bold">P</div>
          <div>
            <h1 className="text-lg font-bold">ProductHub</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
        <div className="rounded-xl bg-indigo-500/20 px-4 py-3 font-medium text-indigo-300">
          ▦ &nbsp; Products
        </div>

        <div className="mt-auto hidden border-t border-slate-800 pt-5 text-sm text-slate-400 md:block">
          React CRUD Dashboard
          <p className="mt-1 text-xs">Powered by DummyJSON API</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-slate-500">Workspace / Products</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Products</h2>
            <p className="mt-2 text-sm text-slate-500">Manage your inventory in one place.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            API Connected
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <div className="mt-3 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{products.length}</h3>
              <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-600">Inventory</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Combined Listed Value</p>
            <div className="mt-3 flex items-end justify-between">
              <h3 className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Total value</span>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold">{editId !== null ? 'Update Product' : 'Add New Product'}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {editId !== null ? 'Edit the details below and save your changes.' : 'Enter product details to add an item to the inventory.'}
            </p>
          </div>

          <form onSubmit={saveProduct} className="grid gap-4 md:grid-cols-[1fr_180px_auto_auto]">
            <input
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Product name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="number"
              min="0"
              step="any"
              placeholder="Price ($)"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
            <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">
              {editId !== null ? 'Save Changes' : '+ Add Product'}
            </button>
            {editId !== null && (
              <button type="button" onClick={() => {
                setEditId(null)
                setTitle('')
                setPrice('')
              }} className="rounded-xl border border-slate-200 px-5 py-3 font-medium hover:bg-slate-50">
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
            <div>
              <h3 className="text-lg font-bold">Product Inventory</h3>
              <p className="mt-1 text-sm text-slate-500">View and manage your products.</p>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-500 sm:w-64"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading products...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">No products found.</td></tr>
                ) : filtered.map(product => (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{product.title}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">#{product.id}</td>
                    <td className="px-6 py-4 font-semibold">${Number(product.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => editProduct(product)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="rounded-lg border border-red-100 px-3 py-2 font-medium text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing {filtered.length} of {products.length} products
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          ProductHub · React + Tailwind CSS · DummyJSON API
        </footer>
      </main>
    </div>
  )
}

export default App

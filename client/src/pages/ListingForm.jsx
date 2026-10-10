import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  description: '',
  price: 0,
  category: 'other',
  condition: 'used',
  status: 'active',
}

const categories = [
  'textbooks',
  'electronics',
  'furniture',
  'clothing',
  'other',
]

const conditions = ['new', 'like-new', 'used', 'worn']
const statuses = ['active', 'sold']

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load the existing listing when editing.
  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadListing() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/listings/${id}`)
        const listing = response.data?.listing ?? response.data

        if (!cancelled) {
          setForm({
            ...defaults,
            ...listing,
            price: Number(listing.price ?? 0),
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              'Failed to load listing.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [id])

  // Keep the form state synchronized with the inputs.
  function onChange(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: name === 'price' ? Number(value) : value,
    }))
  }

  // Create a listing or update an existing one.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Please enter a title.')
      return
    }

    if (form.price < 0 || !Number.isFinite(form.price)) {
      setError('Please enter a valid price.')
      return
    }

    setLoading(true)

    try {
      const { seller, ...editableFields } = form

const payload = {
  ...editableFields,
  title: form.title.trim(),
  description: form.description.trim(),
  price: Number(form.price),
}

      if (id) {
        await api.patch(`/listings/${id}`, payload)
      } else {
        await api.post('/listings', payload)
      }

      nav('/listings')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to save listing.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && id && !form.title) {
    return <div className="max-w-lg mx-auto card">Loading listing...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit Listing' : 'New Listing'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={onChange}
            className="input w-full"
            placeholder="What are you selling?"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            className="input w-full"
            min="-1000"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={onChange}
            className="input w-full"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={onChange}
            className="input w-full"
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition.replace('-', ' ').replace(/\b\w/g, (letter) =>
                  letter.toUpperCase()
                )}
              </option>
            ))}
          </select>
        </div>

        {id && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
              className="input w-full"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            className="input w-full"
            rows={4}
            placeholder="Describe your item..."
            maxLength={2000}
          />
        </div>

        {error && (
          <div role="alert" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}

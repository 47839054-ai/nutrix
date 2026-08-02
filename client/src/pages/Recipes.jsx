import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  Plus,
  X,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  ChefHat,
  Flame,
  Beef,
  Wheat,
  Cookie,
  Check,
} from 'lucide-react'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState(1)
  const [ingredients, setIngredients] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(100)

  const loadRecipes = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.recipes.get()
      setRecipes(data.recipes || [])
    } catch (err) {
      setError(err.message || 'Error al cargar las recetas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')
    try {
      const data = await api.foods.search(searchQuery.trim(), 1, 15)
      setSearchResults(data.foods || [])
    } catch (err) {
      setError(err.message || 'Error al buscar alimentos')
    } finally {
      setSearching(false)
    }
  }

  const addIngredient = (food) => {
    const n = food.nutritionPer100g || {}
    const factor = (parseFloat(selectedQuantity) || 0) / 100
    const item = {
      foodId: food._id || food.id || null,
      name: food.name,
      quantity: parseFloat(selectedQuantity) || 100,
      calories: Math.round((n.calories || 0) * factor * 10) / 10,
      protein: Math.round((n.protein || 0) * factor * 10) / 10,
      fat: Math.round((n.fat || 0) * factor * 10) / 10,
      carbs: Math.round((n.carbs || 0) * factor * 10) / 10,
    }
    setIngredients((prev) => [...prev, item])
    setSearchResults([])
    setSearchQuery('')
  }

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const updateIngredientQuantity = (index, quantity) => {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing
        const food = searchResults.find((s) => s.name === ing.name)
        const n = food ? food.nutritionPer100g || {} : {}
        const factor = (parseFloat(quantity) || 0) / 100
        return {
          ...ing,
          quantity: parseFloat(quantity) || 0,
          calories: Math.round((n.calories || 0) * factor * 10) / 10,
          protein: Math.round((n.protein || 0) * factor * 10) / 10,
          fat: Math.round((n.fat || 0) * factor * 10) / 10,
          carbs: Math.round((n.carbs || 0) * factor * 10) / 10,
        }
      })
    )
  }

  const totals = ingredients.reduce(
    (acc, ing) => {
      acc.calories += ing.calories || 0
      acc.protein += ing.protein || 0
      acc.fat += ing.fat || 0
      acc.carbs += ing.carbs || 0
      return acc
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Escribí un nombre para la receta')
      return
    }
    if (ingredients.length === 0) {
      setError('Agregá al menos un ingrediente')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.recipes.create({
        name,
        description,
        servings: parseInt(servings) || 1,
        ingredients: ingredients.map(({ foodId, name: n, quantity }) => ({ foodId, name: n, quantity })),
      })
      setCreating(false)
      setName('')
      setDescription('')
      setServings(1)
      setIngredients([])
      setSearchResults([])
      setSearchQuery('')
      await loadRecipes()
    } catch (err) {
      setError(err.message || 'Error al crear la receta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.recipes.delete(id)
      setRecipes((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      setError(err.message || 'Error al eliminar la receta')
    }
  }

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis recetas</h2>
        <button
          onClick={() => {
            setCreating((prev) => !prev)
            setError('')
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-colors"
        >
          {creating ? (
            <>
              <X className="w-4 h-4" />
              Cerrar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Crear receta
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {creating && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-brand-500" />
            <h3 className="section-title mb-0">Crear receta</h3>
          </div>

          <div>
            <label className="label">Nombre de la receta</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: Pollo al horno con papas"
            />
          </div>

          <div>
            <label className="label">Descripción (opcional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="Una breve descripción..."
            />
          </div>

          <div>
            <label className="label">Porciones</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="input-field"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="w-4 h-4" />
                personas
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Ingredientes</label>

            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field flex-1"
                placeholder="Buscar alimento..."
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="btn-primary flex items-center gap-1.5"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Cantidad (g):</label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                className="input-field w-24"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {searchResults.map((food) => (
                  <button
                    key={food._id || food.name}
                    onClick={() => addIngredient(food)}
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:border-brand-400 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {food.name}
                      </p>
                      {food.brand && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{food.brand}</p>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {ingredients.length > 0 && (
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {ing.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ing.calories || 0} kcal · {ing.protein || 0}g prot · {ing.carbs || 0}g carb ·{' '}
                        {ing.fat || 0}g grasa
                      </p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={ing.quantity}
                      onChange={(e) => updateIngredientQuantity(i, e.target.value)}
                      className="input-field w-20 text-sm"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">g</span>
                    <button
                      onClick={() => removeIngredient(i)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {ingredients.length > 0 && (
              <div className="card bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(totals.calories)}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">kcal total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(totals.protein)}g
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">proteína</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(totals.carbs)}g
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">carbos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(totals.fat)}g
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">grasas</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {Math.round(totals.calories / Math.max(1, parseInt(servings) || 1))} kcal por porción
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Guardar receta
              </>
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            No tenés recetas todavía
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Creá tus recetas con alimentos de la base y guardá su información nutricional.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="card space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {recipe.name}
                  </h4>
                  {recipe.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{recipe.description}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    {recipe.servings} porción{recipe.servings > 1 ? 'es' : ''} · {recipe.ingredients?.length || 0} ingredientes
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(recipe._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar receta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <Flame className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {recipe.totalCalories}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">kcal</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <Beef className="w-4 h-4 text-red-500 mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {recipe.totalProtein}g
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">prot</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {recipe.totalCarbs}g
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">carb</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <Cookie className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {recipe.totalFat}g
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">grasa</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {Math.round(recipe.totalCalories / Math.max(1, recipe.servings))} kcal por porción
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
